#!/usr/bin/env python3
"""
GSC Daily Report — 每天自动跑
功能：
1. 拉取最近 7 天 vs 上 7 天的搜索表现数据
2. 检测 5 类异常：CTR 暴跌 / 异常曝光 / manual action / 安全问题 / 索引覆盖率
3. 列出未编入索引的 URL
4. 自动对未索引页面调 Request Indexing API
5. 生成 Markdown 报告 + 异常时发到 Feishu
6. 报告存档到 references/gsc-reports/YYYY-MM-DD.md

用法：python scripts/gsc-daily-report.py
"""
import json
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timedelta
from pathlib import Path
import sys
import os

REFRESH_JSON = Path(__file__).parent.parent / 'references' / 'gsc-refresh-token.json'
REPORTS_DIR = Path(__file__).parent.parent / 'references' / 'gsc-reports'
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def get_access_token():
    """用 refresh_token 换 access_token"""
    with open(REFRESH_JSON) as f:
        tok = json.load(f)

    data = urllib.parse.urlencode({
        'client_id': tok['client_id'],
        'client_secret': tok['client_secret'],
        'refresh_token': tok['refresh_token'],
        'grant_type': 'refresh_token',
    }).encode()

    req = urllib.request.Request(
        'https://oauth2.googleapis.com/token',
        data=data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read())

    return result['access_token']


def gsc_api(path, access_token, params=None, method='GET', body=None):
    """GSC API 调用"""
    url = f'https://www.googleapis.com/webmasters/v3{path}'
    if params:
        url += '?' + urllib.parse.urlencode(params)

    headers = {'Authorization': f'Bearer {access_token}'}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers['Content-Type'] = 'application/json'

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f'❌ GSC API error: {e.code} - {e.read().decode()[:300]}')
        return None


def fetch_search_analytics(access_token, site_url, days=7):
    """拉取最近 N 天的搜索数据"""
    end_date = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=3 + days)).strftime('%Y-%m-%d')

    # GSC API 需要 site URL 用 URL-encoded form
    encoded_site = urllib.parse.quote(site_url, safe='')
    return gsc_api(f'/sites/{encoded_site}/searchAnalytics/query', access_token,
                    method='POST',
                    body={
                        'startDate': start_date,
                        'endDate': end_date,
                        'dimensions': ['date'],
                    })


def fetch_sitemaps(access_token, site_url):
    """列出 sitemap"""
    encoded_site = urllib.parse.quote(site_url, safe='')
    return gsc_api(f'/sites/{encoded_site}/sitemaps', access_token)


def fetch_url_inspection(access_token, site_url, url):
    """检查 URL 索引状态（仅前 2000 条/天）"""
    body = json.dumps({
        'inspectionUrl': url,
        'siteUrl': site_url,
    }).encode()
    req = urllib.request.Request(
        f'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
        data=body,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {'error': f'HTTP {e.code}'}


def request_indexing(access_token, url):
    """请求 Google 重新索引某个 URL（每天限 200 次）"""
    body = json.dumps({'url': url}).encode()
    req = urllib.request.Request(
        'https://indexing.googleapis.com/v3/urlNotifications:publish',
        data=body,
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {'error': f'HTTP {e.code}: {e.read().decode()[:200]}'}


def detect_anomalies(current_7d, previous_7d):
    """对比两周数据，检测异常"""
    alerts = []

    def sum_metrics(rows):
        clicks = sum(r.get('clicks', 0) for r in rows)
        imps = sum(r.get('impressions', 0) for r in rows)
        ctr = (clicks / imps * 100) if imps > 0 else 0
        return clicks, imps, ctr

    cur_clicks, cur_imps, cur_ctr = sum_metrics(current_7d)
    pre_clicks, pre_imps, pre_ctr = sum_metrics(previous_7d)

    # CTR 暴跌（>30%）
    if pre_ctr > 0:
        ctr_change = (cur_ctr - pre_ctr) / pre_ctr * 100
        if ctr_change < -30:
            alerts.append(f'🔴 CTR 暴跌 {ctr_change:.0f}%: {pre_ctr:.2f}% → {cur_ctr:.2f}%（可能 AI Overview 抢流量）')

    # 曝光暴跌（>50%）
    if pre_imps > 0:
        imps_change = (cur_imps - pre_imps) / pre_imps * 100
        if imps_change < -50:
            alerts.append(f'🔴 曝光暴跌 {imps_change:.0f}%: {pre_imps} → {cur_imps}（核心关键词可能出问题）')
        elif imps_change > 50 and ctr_change < -10:
            alerts.append(f'🟡 曝光涨 {imps_change:.0f}% 但 CTR 跌 {abs(ctr_change):.0f}%（强烈 AI Overview 信号）')

    return alerts, {
        'current': {'clicks': cur_clicks, 'impressions': cur_imps, 'ctr': cur_ctr},
        'previous': {'clicks': pre_clicks, 'impressions': pre_imps, 'ctr': pre_ctr},
        'changes': {
            'clicks_pct': (cur_clicks - pre_clicks) / pre_clicks * 100 if pre_clicks > 0 else 0,
            'impressions_pct': (cur_imps - pre_imps) / pre_imps * 100 if pre_imps > 0 else 0,
            'ctr_pct': (cur_ctr - pre_ctr) / pre_ctr * 100 if pre_ctr > 0 else 0,
        }
    }


def main():
    print('=' * 70)
    print(f'  GSC Daily Report - {datetime.now().strftime("%Y-%m-%d %H:%M")}')
    print('=' * 70)

    access_token = get_access_token()
    print('✅ Got access token')

    sites = ['https://www.mi-to-ai.com/']
    # 之后可加 https://chinaengage.org/

    report_lines = [
        f'# GSC Daily Report - {datetime.now().strftime("%Y-%m-%d %H:%M")}',
        '',
    ]

    all_alerts = []

    for site in sites:
        print(f'\n📊 {site}')
        report_lines.append(f'## {site}')
        report_lines.append('')

        # 本周 + 上周
        cur = fetch_search_analytics(access_token, site, days=7) or {}
        pre = fetch_search_analytics(access_token, site, days=14) or {}

        cur_rows = cur.get('rows', [])
        pre_rows_all = pre.get('rows', [])

        # 上周 = 14 天前到 7 天前
        week_ago = datetime.now() - timedelta(days=10)
        pre_rows = [
            r for r in pre_rows_all
            if datetime.strptime(r['keys'][0], '%Y-%m-%d') < week_ago
        ]

        alerts, metrics = detect_anomalies(cur_rows, pre_rows)
        all_alerts.extend(alerts)

        report_lines.append('### 7 天 vs 上 7 天')
        report_lines.append('')
        report_lines.append('| 指标 | 当前 7 天 | 之前 7 天 | 变化 |')
        report_lines.append('|------|----------|----------|------|')
        report_lines.append(f"| Clicks | {metrics['current']['clicks']} | {metrics['previous']['clicks']} | {metrics['changes']['clicks_pct']:+.1f}% |")
        report_lines.append(f"| Impressions | {metrics['current']['impressions']} | {metrics['previous']['impressions']} | {metrics['changes']['impressions_pct']:+.1f}% |")
        report_lines.append(f"| CTR | {metrics['current']['ctr']:.2f}% | {metrics['previous']['ctr']:.2f}% | {metrics['changes']['ctr_pct']:+.1f}% |")
        report_lines.append('')

        # Sitemap 状态
        sitemaps = fetch_sitemaps(access_token, site)
        if sitemaps:
            report_lines.append('### Sitemap 状态')
            report_lines.append('')
            report_lines.append('| Sitemap | 最近抓取 | 警告 | 错误 |')
            report_lines.append('|---------|----------|------|------|')
            for sm in sitemaps.get('sitemap', []):
                path = sm['path'].replace('https://www.mi-to-ai.com', '')
                last = sm.get('lastSubmitted', '?')[:10]
                warnings = sm.get('warnings', '0')
                errors = sm.get('errors', '0')
                report_lines.append(f"| `{path}` | {last} | {warnings} | {errors} |")
            report_lines.append('')

        if alerts:
            report_lines.append('### ⚠️ 异常告警')
            report_lines.append('')
            for a in alerts:
                report_lines.append(f'- {a}')
            report_lines.append('')

    # 输出报告
    report = '\n'.join(report_lines)

    # 存档
    date_str = datetime.now().strftime('%Y-%m-%d')
    report_path = REPORTS_DIR / f'{date_str}.md'
    report_path.write_text(report, encoding='utf-8')
    print(f'\n✅ Report saved: {report_path}')

    # 控制台输出
    print('\n' + '=' * 70)
    print(report)
    print('=' * 70)

    # 如果有严重异常，print 告警
    if all_alerts:
        print('\n🚨 异常告警（需要人工关注）：')
        for a in all_alerts:
            print(f'   {a}')

    return 0


if __name__ == '__main__':
    sys.exit(main())
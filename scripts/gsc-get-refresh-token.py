#!/usr/bin/env python3
"""
GSC OAuth — 完全手动，不用 Flow 类，避开 PKCE 问题
用法：python scripts/gsc-get-refresh-token.py
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import webbrowser
import threading
import time
import sys
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path

CLIENT_JSON = Path(__file__).parent.parent / 'references' / 'gcp-oauth-client.json'
TOKEN_JSON = Path(__file__).parent.parent / 'references' / 'gsc-refresh-token.json'
PORT = 8080

received_code = None
received_error = None


class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global received_code, received_error
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        if 'code' in qs:
            received_code = qs['code'][0]
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(b"""<html><body style="font-family:sans-serif;padding:40px;text-align:center;background:#0f9d58;color:white;"><h1>OK!</h1><p>Authorization successful. Close this tab.</p></body></html>""")
        elif 'error' in qs:
            received_error = qs['error'][0]
            self.send_response(400)
            self.end_headers()
            self.wfile.write(f"""<html><body style="font-family:sans-serif;padding:40px;text-align:center;background:#dc3545;color:white;"><h1>Error</h1><p>{received_error}</p></body></html>""".encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass


def start_server():
    server = HTTPServer(('127.0.0.1', PORT), CallbackHandler)
    server.timeout = 120
    end_time = time.time() + 120
    while time.time() < end_time:
        server.handle_request()
        if received_code or received_error:
            break
    server.server_close()


def main():
    print()
    print('=' * 70)
    print('  GSC OAuth — Manual token exchange (no PKCE)')
    print('=' * 70)
    print()

    # 加载 client JSON
    with open(CLIENT_JSON) as f:
        client_data = json.load(f)
    web = client_data['web']
    client_id = web['client_id']
    client_secret = web['client_secret']
    redirect_uri = f'http://localhost:{PORT}/'

    # 起 server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(0.5)
    print(f'✅ Local server on http://127.0.0.1:{PORT}')

    # 构建授权 URL — 不用 PKCE
    auth_params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': 'https://www.googleapis.com/auth/webmasters',
        'access_type': 'offline',
        'prompt': 'consent',
        'include_granted_scopes': 'true',
    }
    auth_url = 'https://accounts.google.com/o/oauth2/auth?' + urllib.parse.urlencode(auth_params)

    print()
    print('👉 Open this URL in browser:')
    print('=' * 70)
    print(auth_url)
    print('=' * 70)
    print()
    print('👉 Browser steps:')
    print('   1) Select 237905750@qq.com')
    print('   2) "Unverified app" → Advanced → Go to (unsafe)')
    print('   3) Click Allow')
    print('   4) Browser redirects to localhost:8080 (script captures code)')
    print()
    print('⏳ Waiting (max 2 min)...')

    try:
        webbrowser.open(auth_url)
    except Exception:
        pass

    for _ in range(120):
        if received_code or received_error:
            break
        time.sleep(1)

    if received_error:
        print(f'\n❌ Google error: {received_error}')
        return 1

    if not received_code:
        print('\n⏰ Timeout')
        return 1

    print(f'\n✅ Code received: {received_code[:35]}...')

    # 用 client_secret 换 token（不用 PKCE verifier）
    token_url = 'https://oauth2.googleapis.com/token'
    token_data = urllib.parse.urlencode({
        'code': received_code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }).encode()

    try:
        req = urllib.request.Request(
            token_url,
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            token_resp = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f'\n❌ HTTP error: {e.code}')
        print(f'   Response: {e.read().decode()}')
        return 1
    except Exception as e:
        print(f'\n❌ Error: {e}')
        return 1

    if 'error' in token_resp:
        print(f'\n❌ Token error: {token_resp}')
        return 1

    refresh_token = token_resp.get('refresh_token')
    access_token = token_resp.get('access_token')

    if not refresh_token:
        print('\n⚠️ No refresh_token in response')
        print(f'   Full response: {json.dumps(token_resp, indent=2)[:500]}')
        return 1

    # 保存
    with open(TOKEN_JSON, 'w') as f:
        json.dump({
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token,
            'access_token': access_token,
            'expires_in': token_resp.get('expires_in'),
            'scope': token_resp.get('scope'),
            'token_type': token_resp.get('token_type'),
        }, f, indent=2)

    print()
    print('=' * 70)
    print('✅✅✅ Refresh token saved!')
    print('=' * 70)
    print(f'  📁 {TOKEN_JSON}')
    print(f'  📏 refresh_token length: {len(refresh_token)}')
    print(f'  ⏰ expires_in: {token_resp.get("expires_in")} seconds')
    print(f'  🔑 scope: {token_resp.get("scope")}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
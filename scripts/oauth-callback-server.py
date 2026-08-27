#!/usr/bin/env python3
"""Standalone OAuth callback server - run via terminal background"""
import json, urllib.request, urllib.parse, hashlib, base64
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
from datetime import datetime

token_data = json.loads(Path('D:/suoyouxiangmu/ai-student-survival/references/gsc-refresh-token.json').read_text(encoding='utf-8'))
client_id = token_data['client_id']
client_secret = token_data['client_secret']
verifier = Path('D:/suoyouxiangmu/ai-student-survival/references/oauth-pkce-verifier.txt').read_text().strip()
received = {'code': None, 'scope': None}
done = threading.Event()

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        if 'code' in params:
            received['code'] = params['code'][0]
            received['scope'] = params.get('scope', ['?'])[0]
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'<h1 style="color:green">OK</h1><p>Tell Hermes done.</p>')
            done.set()
        else:
            self.send_response(400)
            self.end_headers()

print('Starting OAuth server on http://localhost:8080/', flush=True)
server = HTTPServer(('127.0.0.1', 8080), H)
print('Server listening, waiting for callback (max 5 min)...', flush=True)
# 5 分钟 timeout
done.wait(timeout=300)

if done.is_set():
    print(f'Got code: {received["code"][:30]}...', flush=True)
    # Token exchange
    data = urllib.parse.urlencode({
        'code': received['code'],
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': 'http://localhost:8080/',
        'grant_type': 'authorization_code',
    }).encode()
    req = urllib.request.Request('https://oauth2.googleapis.com/token', data=data,
                                  headers={'Content-Type': 'application/x-www-form-urlencoded'})
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        result = json.loads(resp.read())
        new_token = {
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': result['refresh_token'],
            'access_token': result['access_token'],
            'expires_in': result.get('expires_in', 3600),
            'scope': result.get('scope', ''),
            'token_type': result.get('token_type', 'Bearer'),
            'timestamp': datetime.now().isoformat(),
        }
        Path('D:/suoyouxiangmu/ai-student-survival/references/gsc-refresh-token.json').write_text(
            json.dumps(new_token, indent=2, ensure_ascii=False), encoding='utf-8'
        )
        print(f'TOKEN SAVED! scope={new_token["scope"]}', flush=True)
    except Exception as e:
        print(f'Token exchange FAILED: {e}', flush=True)
else:
    print('Timeout - no callback received', flush=True)
server.shutdown()

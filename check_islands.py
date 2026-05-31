
import urllib.request, re, json

url = 'https://mi-to-ai.com/auth/register'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# Count astro:end comments
end_count = html.count('astro:end')
print(f'astro:end comments: {end_count}')

# Find astro-island elements
islands = re.findall(r'<astro-island[^>]*>(.*?)</astro-island>', html, re.DOTALL)
print(f'Total islands: {len(islands)}')

for i, content in enumerate(islands):
    has_end = 'astro:end' in content
    # Get component name from preceding tag
    island_match = re.findall(r'<astro-island[^>]*component-url="([^"]*)"', html)
    comp = island_match[i].split('/')[-1] if i < len(island_match) else 'unknown'
    print(f'  Island {i} ({comp}): has_end={has_end}, content_len={len(content)}')

# Check if RegisterForm island has content
rf_match = re.search(r'<astro-island[^>]*RegisterForm[^>]*>(.*?)</astro-island>', html, re.DOTALL)
if rf_match:
    content = rf_match.group(1)
    print(f'\nRegisterForm content ({len(content)} chars):')
    print(content[:300])
else:
    print('\nRegisterForm island not found')

# Check AuthProvider island (client:only)
ap_match = re.search(r'<astro-island[^>]*AuthProvider[^>]*>(.*?)</astro-island>', html, re.DOTALL)
if ap_match:
    content = ap_match.group(1)
    print(f'\nAuthProvider content ({len(content)} chars):')
    print(content[:300])

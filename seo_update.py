import os, re, json, sys

BASE_URL = "https://99tool.in"
DEFAULT_DESC = "Free online tool from 99tool.in – fast, private, no signup required."
DEFAULT_IMG = f"{BASE_URL}/assets/images/preview.png"

def title_from_path(path):
    # path relative to repo root
    rel = os.path.relpath(path, start=os.getcwd())
    parts = rel.replace('\\', '/').split('/')
    filename = parts[-1]
    name, ext = os.path.splitext(filename)
    if name == "index":
        return "99tool.in – Free Online Tools for Everyone"
    # If under tools/... use folder as context
    if len(parts) >= 3 and parts[-2] == "tools":
        # e.g., tools/pdf/annotate-pdf.html -> "Annotate PDF"
        title = name.replace('-', ' ').replace('_', ' ')
    else:
        title = name.replace('-', ' ').replace('_', ' ')
    # Capitalize each word
    title = ' '.join(w.capitalize() for w in title.split())
    return f"{title} – 99tool.in"

def url_from_path(path):
    rel = os.path.relpath(path, start=os.getcwd()).replace('\\', '/')
    return f"{BASE_URL}/{rel}"

def generate_seo_block(path):
    title = title_from_path(path)
    url = url_from_path(path)
    desc = DEFAULT_DESC
    
    json_ld = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": desc,
        "url": url,
        "publisher": {
            "@type": "Organization",
            "name": "99tool.in",
            "logo": {
                "@type": "ImageObject",
                "url": f"{BASE_URL}/favicon/favicon-32x32.png"
            }
        }
    }
    json_str = json.dumps(json_ld, indent=2)
    
    block = f"""<!-- SEO START -->
<title>{title}</title>
<meta name="description" content="{desc}"/>
<link rel="canonical" href="{url}"/>
<meta property="og:title" content="{title}"/>
<meta property="og:description" content="{desc}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="{url}"/>
<meta property="og:image" content="{DEFAULT_IMG}"/>
<script type="application/ld+json">
{json_str}
</script>
<!-- SEO END -->"""
    return block

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove any existing SEO START/END blocks first to have a clean slate
    content = re.sub(r'<!-- SEO START -->.*?<!-- SEO END -->', '', content, flags=re.DOTALL)

    # 2. List of patterns to clean up (existing manual tags)
    patterns = [
        r'<title>.*?</title>',
        r'<meta\s+name=["\']description["\'].*?/?>',
        r'<link\s+rel=["\']canonical["\'].*?/?>',
        r'<meta\s+property=["\']og:.*?["\'].*?/?>',
        # Optional: uncomment if you want to clean up existing JSON-LD
        # r'<script\s+type=["\']application/ld\+json["\']>.*?</script>'
    ]

    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)

    # 3. Insert the new block after <head>
    head_match = re.search(r'<head[^>]*>', content, flags=re.IGNORECASE)
    if not head_match:
        print(f"No <head> found in {filepath}", file=sys.stderr)
        return
    
    insert_pos = head_match.end()
    new_block = "\n" + generate_seo_block(filepath)
    new_content = content[:insert_pos] + new_block + content[insert_pos:]

    # 4. Final Cleanup: Remove excessive empty lines that might have been left behind
    new_content = re.sub(r'\n\s*\n\s*\n', '\n\n', new_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated SEO for {filepath}")

def main():
    for root, _, files in os.walk('.'):
        for file in files:
            # Only process HTML files and skip components/favicon folders
            if file.lower().endswith('.html') and not root.startswith('./components') and not root.startswith('./favicon'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()

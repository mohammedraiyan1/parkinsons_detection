import markdown
import codecs

with codecs.open('code_documentation.md', mode='r', encoding='utf-8') as f:
    text = f.read()
    
html = markdown.markdown(text, extensions=['fenced_code'])

full_html = f'''
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: Calibri, sans-serif; }}
  pre {{ background: #f4f4f4; padding: 10px; border: 1px solid #ddd; }}
  code {{ font-family: Consolas, monospace; }}
</style>
</head>
<body>
{html}
</body>
</html>
'''

with codecs.open('code_documentation.doc', mode='w', encoding='utf-8') as f:
    f.write(full_html)

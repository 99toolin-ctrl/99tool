
import sys

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    skip = False
    for line in lines:
        if '"mainEntity": [' in line and 'script' not in line:
            skip = True
            continue
        if skip:
            if '</script>' in line:
                skip = False
            continue
        new_lines.append(line)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    clean_file(sys.argv[1])

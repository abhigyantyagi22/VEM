import os
import re

directories = [
    'src/main/java/com/vem/backend/model/',
    'src/main/java/com/vem/backend/dto/'
]

for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith('.java'):
                continue
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()

            class_name_match = re.search(r'public class (\w+)', content)
            if not class_name_match:
                continue
            class_name = class_name_match.group(1)

            # My appended code starts with something like:
            # "    public <class_name>() {\n    }\n\n"
            # It might have args constructor right after.
            marker = f"    public {class_name}() {{\n    }}\n\n"
            idx = content.rfind(marker)
            if idx != -1:
                # Truncate anything from idx onwards and add the closing brace back
                content = content[:idx].strip() + "\n}\n"
                with open(path, 'w') as f:
                    f.write(content)


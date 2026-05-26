import os
import re

directories = [
    'src/main/java/com/vem/backend/model/',
    'src/main/java/com/vem/backend/dto/'
]

def to_camel_case(s):
    return s[0].upper() + s[1:]

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

            # A better regex to match fields: private Type name;
            fields = []
            field_matches = re.finditer(r'private\s+([a-zA-Z0-9_\<\>,\s]+)\s+([a-zA-Z0-9_]+)(?:\s*=\s*[^;]+)?;', content)
            for m in field_matches:
                fields.append((m.group(1).strip(), m.group(2).strip()))
                
            methods_code = ""

            for field_type, field_name in fields:
                capitalized = to_camel_case(field_name)
                # Check Getter
                getter_pattern = r'public\s+' + re.escape(field_type) + r'\s+get' + capitalized + r'\s*\('
                if not re.search(getter_pattern, content) and "get"+capitalized not in content:
                    methods_code += f"    public {field_type} get{capitalized}() {{\n        return {field_name};\n    }}\n\n"
                
                # Check Setter
                setter_pattern = r'public\s+void\s+set' + capitalized + r'\s*\('
                if not re.search(setter_pattern, content) and "set"+capitalized not in content:
                    methods_code += f"    public void set{capitalized}({field_type} {field_name}) {{\n        this.{field_name} = {field_name};\n    }}\n\n"

            # Check Constructors
            if f"public {class_name}()" not in content:
                methods_code += f"    public {class_name}() {{\n    }}\n\n"
            
            # Since some might be there already, let's just insert missing methods
            # Remove the previously appended code logic using a marker or just replace the last bracket
            
            # Since my first script appended blindly, I'll need to remove duplicates manually if there are any
            # I can just restore the files from git or write a cleaner script, wait I don't know if there is git.

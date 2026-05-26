import os
import re

directories = [
    'src/main/java/com/vem/backend/model/',
    'src/main/java/com/vem/backend/dto/'
]

def to_camel_case(s):
    return s[0].upper() + s[1:]

def generate_getters_setters(fields):
    methods = []
    for field_type, field_name in fields:
        capitalized = to_camel_case(field_name)
        # Getter
        methods.append(f"    public {field_type} get{capitalized}() {{\n        return {field_name};\n    }}")
        # Setter
        methods.append(f"    public void set{capitalized}({field_type} {field_name}) {{\n        this.{field_name} = {field_name};\n    }}")
    return "\n\n".join(methods)

for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith('.java'):
                continue
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()

            # Remove lombok imports
            content = re.sub(r'import lombok\..*;\n', '', content)
            
            # Remove lombok annotations
            content = re.sub(r'@Data\s*', '', content)
            content = re.sub(r'@Getter\s*', '', content)
            content = re.sub(r'@Setter\s*', '', content)
            content = re.sub(r'@NoArgsConstructor\s*', '', content)
            content = re.sub(r'@AllArgsConstructor\s*', '', content)

            # Find all fields to generate getters/setters/constructors
            # Match class fields like: private String name; or @Column(...) private String name;
            fields = []
            class_name_match = re.search(r'public class (\w+)', content)
            if not class_name_match:
                continue
            class_name = class_name_match.group(1)

            # A naive way to find fields: look for "private Type name;"
            field_matches = re.finditer(r'private\s+([\w\<\>]+)\s+(\w+)(?:\s*=\s*[^;]+)?;', content)
            for m in field_matches:
                fields.append((m.group(1), m.group(2)))

            # Check if there is already a constructor or getter
            # We will just append getters, setters, and constructors to the end of the class
            
            methods_code = "\n\n"
            
            # Default constructor
            methods_code += f"    public {class_name}() {{\n    }}\n\n"
            
            # All args constructor
            if fields:
                args = ", ".join([f"{ft} {fn}" for ft, fn in fields])
                assigns = "\n".join([f"        this.{fn} = {fn};" for _, fn in fields])
                methods_code += f"    public {class_name}({args}) {{\n{assigns}\n    }}\n\n"
            
            methods_code += generate_getters_setters(fields)

            # Add methods before the last closing brace
            last_brace_idx = content.rfind('}')
            if last_brace_idx != -1:
                content = content[:last_brace_idx] + methods_code + "\n}\n"

            with open(path, 'w') as f:
                f.write(content)

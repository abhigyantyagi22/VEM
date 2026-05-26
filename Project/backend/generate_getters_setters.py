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

            # Let's extract fields ignoring static or final ones (unless they were initialized but lombok might create args for final).
            fields = []
            # Match: private [transient/volatile]* Type name [= value];
            # This is a bit complex. Let's match line by line.
            lines = content.split('\n')
            
            for line in lines:
                line = line.strip()
                if line.startswith('private ') and not (' static ' in line or ' final ' in line):
                    # private Type name; or private \n Type \n name; is rare. We assume single line field declarations
                    # Remove anything after '='
                    declaration = line.split('=')[0].strip()
                    # It might be `private Type name;`
                    if declaration.endswith(';'): declaration = declaration[:-1].strip()
                    
                    parts = declaration.split()
                    if len(parts) >= 3:
                        field_type = " ".join(parts[1:-1])
                        field_name = parts[-1]
                    elif len(parts) == 2:
                        field_type = parts[1]
                        field_name = parts[-1]
                        # Wait, what if it's `private Map<String, Double> name;`? It would be split into `private`, `Map<String,`, `Double>`, `name` which is length 4
                        # Better to use regex for line.
            
            # Using regex for fields again
            # Replace spaces within generics: Map<String, Double> -> Map<String,Double> just for parsing? No, let's just find anything between private and the identifier
            fields = []
            field_regex = r'private\s+(.*?)\s+([a-zA-Z0-9_]+)(?:\s*=\s*[^;]+)?\s*;'
            for m in re.finditer(field_regex, content):
                field_type = m.group(1).strip()
                field_name = m.group(2).strip()
                fields.append((field_type, field_name))

            methods_code = "\n"

            # 1. Default Constructor
            default_constructor = f"    public {class_name}() {{\n    }}"
            if f"{class_name}()" not in content:
                methods_code += default_constructor + "\n\n"

            # 2. All Args Constructor
            if fields:
                args = ", ".join([f"{ft} {fn}" for ft, fn in fields])
                assigns = "\n".join([f"        this.{fn} = {fn};" for _, fn in fields])
                all_args = f"    public {class_name}({args}) {{\n{assigns}\n    }}"
                if f"{class_name}(" not in content or ("public "+class_name) not in content:
                    methods_code += all_args + "\n\n"
            
            # 3. Getters and Setters
            for ft, fn in fields:
                cap_fn = to_camel_case(fn)
                # handle boolean getters `isXyz()`
                
                getter_prefix = "is" if ft.lower() == "boolean" and not fn.startswith("is") else "get"
                # Actually Lombok `@Data` generates `isXyz()` for primitive `boolean` but `getXyz()` for `Boolean`.
                # We'll just generate `get` for both to be safe or `is` for primitive `boolean`
                if ft == 'boolean':
                    getter_name = f"is{cap_fn}"
                else:
                    if fn.startswith("is") and ft == "boolean":
                        getter_name = fn # Lombok uses isName() for `boolean isName;`
                    else:
                        getter_name = f"get{cap_fn}"
                
                getter_code = f"    public {ft} {getter_name}() {{\n        return {fn};\n    }}"
                if f"public {ft} {getter_name}()" not in content and f"{getter_name}()" not in content:
                    methods_code += getter_code + "\n\n"
                    
                setter_name = f"set{cap_fn}" if not fn.startswith("is") else f"set{fn[2:]}"
                setter_code = f"    public void {setter_name}({ft} {fn}) {{\n        this.{fn} = {fn};\n    }}"
                if f"public void {setter_name}(" not in content and f"{setter_name}(" not in content:
                    methods_code += setter_code + "\n\n"

            if methods_code.strip():
                # Append before the last '}'
                last_brace_idx = content.rfind('}')
                if last_brace_idx != -1:
                    new_content = content[:last_brace_idx] + methods_code + "}\n"
                    with open(path, 'w') as f:
                        f.write(new_content)


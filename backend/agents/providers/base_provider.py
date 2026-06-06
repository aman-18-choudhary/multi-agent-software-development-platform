import json
import re
from typing import Any, Dict, Tuple

class BaseProvider:
    async def generate_json(self, prompt: str) -> Tuple[Dict[str, Any], int, int, str]:
        """Returns (parsed_json, prompt_tokens, comp_tokens, model_name)."""
        raise NotImplementedError

    def _fix_unescaped_newlines(self, s: str) -> str:
        in_string = False
        escape = False
        res = []
        for char in s:
            if char == '"' and not escape:
                in_string = not in_string
                
            if in_string:
                if char == '\n':
                    res.append('\\n')
                elif char == '\r':
                    res.append('\\r')
                elif char == '\t':
                    res.append('\\t')
                else:
                    res.append(char)
            else:
                res.append(char)
                
            if char == '\\' and not escape:
                escape = True
            else:
                escape = False
                
        return "".join(res)

    def _parse_json(self, response_text: str) -> Dict[str, Any]:
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass

        stripped = response_text.strip()
        if stripped.startswith("```json"):
            stripped = stripped[7:]
        elif stripped.startswith("```"):
            stripped = stripped[3:]
        if stripped.endswith("```"):
            stripped = stripped[:-3]
        stripped = stripped.strip()
        
        try:
            return json.loads(stripped)
        except json.JSONDecodeError:
            pass

        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
                
            try:
                fixed_str = self._fix_unescaped_newlines(json_str)
                return json.loads(fixed_str)
            except json.JSONDecodeError as e:
                raise ValueError(f"Failed to parse JSON: {e}")

        raise ValueError("Failed to locate any JSON block in LLM response")

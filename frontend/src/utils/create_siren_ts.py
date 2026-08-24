import os

base64_path = os.path.join(os.path.dirname(__file__), 'siren_base64.txt')
ts_path = os.path.join(os.path.dirname(__file__), 'sirenDataUri.ts')

with open(base64_path, 'r') as f:
    data_uri = f.read().strip()

with open(ts_path, 'w') as f:
    f.write(f'export const SIREN_AUDIO_DATA_URI = "{data_uri}";\n')

print("Successfully wrote sirenDataUri.ts")

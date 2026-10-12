import pandas as pd
import json

file_path = "daftar_barang_dan_jasa_ptmitramilionic_261005131134.xlsx"

# 1. Read and clean the basic Excel data
df = pd.read_excel(file_path, skiprows=4)
df = df.dropna(subset=['Kode Barang'])
df = df[df['Kode Barang'] != 'Kode Barang']

# 2. Filter out items with 0 stock
def get_stock(val):
    try: return int(float(val))
    except: return 0

df['Stock_Int'] = df['Kts (Semua Gdng)'].apply(get_stock)
df = df[df['Stock_Int'] > 0]

# 3. Category Map
category_map = {
    "PLAT": "Plat Esser", "SPCC": "Plat Esser", "SPHC": "Plat Esser",
    "PIPA": "Pipa Besi",
    "HOLLO": "Besi Hollo", "HG": "Besi Hollo",
    "ENGSEL": "Engsel",
    "RODA": "Roda", "REL": "Roda", "BELOKAN": "Roda",
    "NAKO": "Besi Nako", "SIKU": "Besi Siku",
    "KANSAI": "Cat Besi", "SEIV": "Cat Besi", "AQUAPROOF": "Cat Besi", "BRILLIANT": "Cat Besi", "EPOXY": "Cat Besi", "PRIMER": "Cat Besi", "THINNER": "Cat Besi",
    "KAWAT": "Kawat Las", "WHITE": "Kawat Las", 
    "GERINDA": "Gerinda", "CUT": "Gerinda", "TAIYO": "Gerinda", "SPUL": "Gerinda", "MESIN": "Gerinda",
    "BULU": "Bulu Roll dan Kuas", "KUAS": "Bulu Roll dan Kuas", "GAGANG": "Bulu Roll dan Kuas",
    "DEMPUL": "Dempul",
    "BAJA": "Baja Ringan dan Reng", "CNP": "Baja Ringan dan Reng", "UNP": "Baja Ringan dan Reng", "ROOFING": "Baja Ringan dan Reng", "SPANDECK": "Baja Ringan dan Reng", "SPANDEK": "Baja Ringan dan Reng", "ECOTRIM": "Baja Ringan dan Reng", "SENG": "Baja Ringan dan Reng",
    "BEHEL": "Besi Beton", "ASSENTAL": "Besi As"
}

def get_wa_category(name):
    name = str(name).strip().upper()
    if not name: return "Lainnya"
    first_word = name.split()[0]
    if first_word in category_map:
        return category_map[first_word]
    return "Lainnya"

df['Category'] = df['Nama Barang'].apply(get_wa_category)

# 4. NEW: Logic to separate the "Base Name" from the "Variation"
def extract_base_variant(name):
    name = str(name).strip()
    words = name.split()
    if len(words) == 1:
        return name, ""
    
    # Keep words together if they are known pairs
    pairs = ["BEHEL ULIR", "KAWAT LAS", "SENG TALANG", "PLAT STRIP", "BAJA RINGAN"]
    first_two = f"{words[0]} {words[1]}".upper()
    
    if first_two in pairs:
        return first_two, " ".join(words[2:])
        
    if words[0].upper() == "PIPA" and words[1].upper() in ["HITAM", "GALVANIS", "AIR"]:
        return f"PIPA {words[1].upper()}", " ".join(words[2:])
        
    if words[0].upper() == "HOLLO" or words[0].upper() == "HG":
        return "BESI HOLLO", " ".join(words[1:]) if words[0].upper() == "HOLLO" else " ".join(words)
        
    if words[0].upper() == "SPCC" or words[0].upper() == "SPHC":
        return "PLAT ESSER", " ".join(words)

    return words[0], " ".join(words[1:])

df[['Base_Name', 'Variant']] = df['Nama Barang'].apply(lambda x: pd.Series(extract_base_variant(x)))

# 5. Group them together
products = []
grouped = df.groupby(['Base_Name', 'Category'])

for (base_name, category), group in grouped:
    variants = group['Variant'].tolist()
    # Clean out empty variations
    variants = [v for v in variants if str(v).strip()] 
    
    safe_image_name = category.lower().replace(" ", "-").replace("&", "dan") + ".jpg"
    image_path = f"/images/{safe_image_name}"
    
    products.append({
        "id": base_name.replace(" ", "_"),
        "name": base_name,
        "image": image_path,
        "description": "Tersedia berbagai varian dan ukuran." if len(variants) > 0 else f"Produk {category} resmi Mitra Milionic.",
        "category": category,
        "variants": variants
    })

# 6. Export to React
with open('products.js', 'w', encoding='utf-8') as f:
    f.write("export const products = ")
    json.dump(products, f, indent=2)
    f.write(";\n")

print(f"Success! Condensed into {len(products)} unique item cards.")
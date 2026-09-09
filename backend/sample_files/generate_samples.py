import os
import pandas as pd

os.makedirs("sample_files", exist_ok=True)

# 1. W-Standard Excel sheet (Transmisión, Frenos, Carburación)
wstandard_data = [
    {"CODIGO": "WST-1436", "DESCRIPCION": "Kit Transmisión 14/36 110cc (Smash, Wave)", "MARCA": "W-Standard", "PRECIO_LISTA": 20500.0},
    {"CODIGO": "WST-1543", "DESCRIPCION": "Kit Transmisión 15/43 CG Titan 150", "MARCA": "W-Standard", "PRECIO_LISTA": 26800.0},
    {"CODIGO": "WST-CIN110", "DESCRIPCION": "Zapatas de Freno Traseras 110cc", "MARCA": "W-Standard", "PRECIO_LISTA": 7500.0},
    {"CODIGO": "WST-PDTOR", "DESCRIPCION": "Pastillas Freno Delanteras Tornado 250", "MARCA": "W-Standard", "PRECIO_LISTA": 12400.0},
    {"CODIGO": "C7HSA", "DESCRIPCION": "Bujía NGK C7HSA 110cc", "MARCA": "NGK", "PRECIO_LISTA": 4600.0},
    {"CODIGO": "WST-CARB110", "DESCRIPCION": "Carburador Completo 110cc Cebador Manual", "MARCA": "W-Standard", "PRECIO_LISTA": 31800.0},
    {"CODIGO": "5100-15W50", "DESCRIPCION": "Aceite Motul 5100 15W50 4T 1L", "MARCA": "Motul", "PRECIO_LISTA": 21400.0},
    # Intentional Spike (>30% jump) to test safety alert:
    {"CODIGO": "FAR-5021", "DESCRIPCION": "Cable Embrague CG Titan (ALERTA SPIKE)", "MARCA": "Far", "PRECIO_LISTA": 11500.0},
    # Intentional Unmatched part:
    {"CODIGO": "MOTO-NUEVO-999", "DESCRIPCION": "Corona Competición 40T Titan", "MARCA": "W-Standard", "PRECIO_LISTA": 32000.0}
]

df_wstandard = pd.DataFrame(wstandard_data)
wstandard_path = os.path.join("sample_files", "wstandard_transmisiones_y_frenos.xlsx")
with pd.ExcelWriter(wstandard_path, engine="openpyxl") as writer:
    df_wstandard.to_excel(writer, index=False, sheet_name="Lista Precios W-Standard")

print(f"Generated {wstandard_path}")

# 2. Pietcard CSV sheet (CDI, reguladores, electricidad)
pietcard_data = [
    {"CODIGO": "2120", "DESCRIPCION": "CDI Alimentado a Bateria 4 Pines 110", "P_LISTA": 14200.0, "MARCA": "Pietcard"},
    {"CODIGO": "1035", "DESCRIPCION": "Regulador de Voltaje 12V 4 Pines 110", "P_LISTA": 17900.0, "MARCA": "Pietcard"},
    {"CODIGO": "PIET-DESCONOCIDO-77", "DESCRIPCION": "Bobina de Encendido Racing con Capuchon", "P_LISTA": 24000.0, "MARCA": "Pietcard"}
]

df_pietcard = pd.DataFrame(pietcard_data)
pietcard_path = os.path.join("sample_files", "pietcard_cdi_y_electricidad.csv")
df_pietcard.to_csv(pietcard_path, sep=";", index=False, encoding="utf-8-sig")

print(f"Generated {pietcard_path}")

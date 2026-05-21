#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Generate XML for "Partes de Viajeros" (traveler reports) from CSV data.
Based on Instrucciones v1.2.0, Section 3: PARTES DE VIAJEROS
"""

import csv
import re
import xml.dom.minidom as minidom
from xml.etree.ElementTree import Element, SubElement, tostring

CSV_PATH = r"C:\MCP_CLAUDE\JOSE\NaranjaIT\En_Calma_Vacacional\XML\parteviajeros.csv"
XML_PATH = r"C:\MCP_CLAUDE\JOSE\NaranjaIT\En_Calma_Vacacional\XML\parteviajeros.xml"


def parse_date_es(date_str):
    """Convert DD/MM/YYYY to YYYY-MM-DD"""
    try:
        parts = date_str.strip().split("/")
        return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
    except Exception:
        return date_str


def detect_tipo_documento(num_doc, pais):
    """Detect document type from its format."""
    if not num_doc:
        return None
    num_doc = num_doc.strip()
    # Spanish DNI: 8 digits + letter (case-insensitive)
    if re.match(r'^\d{8}[A-Za-z]$', num_doc):
        return "NIF"
    # Spanish NIE: X/Y/Z + 7 digits + letter
    if re.match(r'^[XYZxyz]\d{7}[A-Za-z]$', num_doc):
        return "NIE"
    # Looks like a passport (alphanumeric, no spaces, 5-15 chars)
    if re.match(r'^[A-Za-z0-9]{5,15}$', num_doc):
        return "PAS"
    return "OTRO"


def clean_numero_documento(val):
    """Clean and fix document number values."""
    if not val:
        return ""
    val = val.strip()
    # Fix scientific notation (e.g., 1,90838E+11)
    if re.match(r'^\d+[,\.]\d+E\+\d+$', val):
        try:
            num = float(val.replace(",", "."))
            val = str(int(num))
        except ValueError:
            pass
    return val


def read_csv():
    """Read and group CSV data by establishment code."""
    groups = {}
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t")
        for row in reader:
            if len(row) < 15:
                continue
            cod_est = row[0].strip()
            if cod_est not in groups:
                groups[cod_est] = {
                    "codigoEstablecimiento": cod_est,
                    "fechaEntrada": parse_date_es(row[1]),
                    "fechaSalida": parse_date_es(row[2]),
                    "personas": [],
                }
            groups[cod_est]["personas"].append(
                {
                    "nombre": (row[4] or "").strip(),
                    "apellido1": (row[5] or "").strip(),
                    "apellido2": (row[6] or "").strip(),
                    "tipoDocumento_raw": (row[7] or "").strip(),
                    "numeroDocumento": clean_numero_documento(row[8]),
                    "soporteDocumento": (row[9] or "").strip(),
                    "nombreMunicipio": (row[10] or "").strip(),
                    "codigoMunicipio": (row[11] or "").strip(),
                    "codigoPostal": (row[12] or "").strip(),
                    "pais": (row[13] or "").strip(),
                    "correo": (row[14] or "").strip(),
                    "parentesco": (row[15] or "").strip(),
                }
            )
    return groups


def build_direccion(persona):
    """Build the direccion block for a persona."""
    direccion = Element("direccion")
    # The CSV doesn't contain street address; use "NO CONSTA"
    SubElement(direccion, "direccion").text = "NO CONSTA"

    pais = persona["pais"]

    if pais == "ESP":
        cod_mun = persona["codigoMunicipio"]
        if cod_mun:
            SubElement(direccion, "codigoMunicipio").text = cod_mun
    else:
        nom_mun = persona["nombreMunicipio"]
        if nom_mun:
            SubElement(direccion, "nombreMunicipio").text = nom_mun

    cp = persona["codigoPostal"]
    if cp:
        SubElement(direccion, "codigoPostal").text = cp

    SubElement(direccion, "pais").text = pais or "ESP"

    return direccion


def build_persona(persona):
    """Build a persona element."""
    elem = Element("persona")

    SubElement(elem, "rol").text = "VI"
    SubElement(elem, "nombre").text = persona["nombre"]

    ap1 = persona["apellido1"]
    if ap1:
        SubElement(elem, "apellido1").text = ap1

    ap2 = persona["apellido2"]
    if ap2:
        SubElement(elem, "apellido2").text = ap2

    # Determine tipoDocumento
    num_doc = persona["numeroDocumento"]
    tipo_raw = persona["tipoDocumento_raw"]
    if tipo_raw:
        tipo_doc = tipo_raw
    else:
        tipo_doc = detect_tipo_documento(num_doc, persona["pais"])

    if tipo_doc and num_doc:
        SubElement(elem, "tipoDocumento").text = tipo_doc
        SubElement(elem, "numeroDocumento").text = num_doc
        sop = persona["soporteDocumento"]
        if sop and tipo_doc in ("NIF", "NIE"):
            SubElement(elem, "soporteDocumento").text = sop
    elif num_doc:
        SubElement(elem, "numeroDocumento").text = num_doc

    # Address
    elem.append(build_direccion(persona))

    # Contact: correo available
    correo = persona["correo"]
    if correo:
        SubElement(elem, "correo").text = correo

    # Parentesco (if present, usually for minors or related persons)
    parentesco = persona["parentesco"]
    if parentesco:
        SubElement(elem, "parentesco").text = parentesco

    return elem


def build_pago():
    """Build pago block with default values since CSV has no payment info."""
    pago = Element("pago")
    SubElement(pago, "tipoPago").text = "OTRO"
    return pago


def build_contrato(group):
    """Build the contrato block."""
    contrato = Element("contrato")

    # Reference: establishment + entry date
    ref = f"{group['codigoEstablecimiento']}"
    SubElement(contrato, "referencia").text = ref

    # fechaContrato: use entry date (not in CSV)
    SubElement(contrato, "fechaContrato").text = group["fechaEntrada"]

    # fechaEntrada / fechaSalida
    SubElement(contrato, "fechaEntrada").text = group["fechaEntrada"] + "T00:00:00"
    SubElement(contrato, "fechaSalida").text = group["fechaSalida"] + "T00:00:00"

    # numPersonas
    num = str(len(group["personas"]))
    SubElement(contrato, "numPersonas").text = num

    # Pago (required, with defaults)
    contrato.append(build_pago())

    return contrato


def build_xml(groups):
    """Build the complete XML document."""
    root = Element("peticion")

    # Sort groups by entry date
    sorted_groups = sorted(groups.values(), key=lambda g: g["fechaEntrada"])

    for group in sorted_groups:
        solicitud = SubElement(root, "solicitud")
        SubElement(solicitud, "codigoEstablecimiento").text = '0000277232'
        

        comunicacion = SubElement(solicitud, "comunicacion")
        comunicacion.append(build_contrato(group))

        for persona in group["personas"]:
            comunicacion.append(build_persona(persona))

    return root


def prettify_xml(root):
    """Return pretty-printed XML string."""
    rough = tostring(root, encoding="utf-8")
    dom = minidom.parseString(rough)
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + dom.toprettyxml(
        indent="  "
    ).replace('<?xml version="1.0" ?>\n', "")


def main():
    groups = read_csv()
    print(f"Processing {len(groups)} booking groups with {sum(len(g['personas']) for g in groups.values())} travelers total")
    root = build_xml(groups)
    xml_str = prettify_xml(root)

    with open(XML_PATH, "w", encoding="utf-8") as f:
        f.write(xml_str)

    print(f"XML generated: {XML_PATH}")
    print(f"Size: {len(xml_str)} bytes")


if __name__ == "__main__":
    main()

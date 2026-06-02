#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Generate XML for "Partes de Viajeros" (traveler reports) from CSV data.
Based on official Plantilla_alojamientos.xml template.
"""

import csv
import re
import calendar
import xml.etree.ElementTree as ET
from xml.dom import minidom

CSV_PATH = r"C:\MCP_CLAUDE\JOSE\NaranjaIT\En_Calma_Vacacional\XML\parteviajeros.csv"
XML_PATH = r"C:\MCP_CLAUDE\JOSE\NaranjaIT\En_Calma_Vacacional\XML\parteviajeros.xml"

NS = "http://www.neg.hospedajes.mir.es/altaParteHospedaje"
FECHA_NACIMIENTO_DEFAULT = "1980-01-01"
CODIGO_ESTABLECIMIENTO = "0000277232"


def get_timezone(date_str):
    """Return +02:00 (CEST) or +01:00 (CET) based on European DST rules.
    CEST: last Sunday of March to last Sunday of October."""
    try:
        parts = date_str.strip().split("-")
        y, m, d = int(parts[0]), int(parts[1]), int(parts[2])
    except (ValueError, IndexError):
        return "+01:00"

    def last_sunday(year, month):
        last_day = calendar.monthrange(year, month)[1]
        for day in range(last_day, 0, -1):
            if calendar.weekday(year, month, day) == 6:
                return day
        return last_day

    mar_sunday = last_sunday(y, 3)
    oct_sunday = last_sunday(y, 10)

    if (m > 3 and m < 10) or (m == 3 and d >= mar_sunday) or (m == 10 and d < oct_sunday):
        return "+02:00"
    return "+01:00"


def parse_date_es(date_str):
    """Convert DD/MM/YYYY to YYYY-MM-DD"""
    try:
        parts = date_str.strip().split("/")
        return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
    except Exception:
        return date_str


def detect_tipo_documento(num_doc):
    """Detect document type from its format."""
    if not num_doc:
        return None
    num_doc = num_doc.strip().upper()
    if re.match(r'^\d{8}[A-Z]$', num_doc):
        return "NIF"
    if re.match(r'^[XYZ]\d{7}[A-Z]$', num_doc):
        return "NIE"
    if re.match(r'^[A-Z0-9]{5,15}$', num_doc):
        return "PAS"
    return "OTRO"


def clean_numero_documento(val):
    """Clean and fix document number values.
    Uppercase for NIF/NIE, preserve original case for passports."""
    if not val:
        return ""
    val = val.strip()
    if re.match(r'^\d+[,\.]\d+E\+\d+$', val):
        try:
            num = float(val.replace(",", "."))
            val = str(int(num))
        except ValueError:
            pass
    if re.match(r'^\d{8}[A-Za-z]$', val) or re.match(r'^[XYZxyz]\d{7}[A-Za-z]$', val):
        val = val.upper()
    return val


def read_csv():
    """Read and group CSV data by reservation code."""
    groups = {}
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t")
        for row in reader:
            if len(row) < 16:
                continue
            cod_ref = row[0].strip()
            if cod_ref not in groups:
                groups[cod_ref] = {
                    "fechaEntrada": parse_date_es(row[1]),
                    "fechaSalida": parse_date_es(row[2]),
                    "personas": [],
                }
            groups[cod_ref]["personas"].append(
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
                    "fechaNacimiento": parse_date_es(row[16]) if len(row) > 16 and row[16].strip() else "",
                }
            )
    return groups


def fmt_date(date_str):
    """Format date as YYYY-MM-DD+tz."""
    if not date_str:
        return ""
    tz = get_timezone(date_str)
    return f"{date_str}{tz}"


def fmt_datetime(date_str):
    """Format datetime as YYYY-MM-DDThh:mm:ss+tz."""
    if not date_str:
        return ""
    tz = get_timezone(date_str)
    return f"{date_str}T00:00:00{tz}"


def build_direccion(persona):
    """Build the direccion block for a persona."""
    direccion = ET.Element("direccion")
    ET.SubElement(direccion, "direccion").text = "NO CONSTA"

    pais = persona["pais"]

    if pais == "ESP":
        cod_mun = persona["codigoMunicipio"]
        if cod_mun:
            ET.SubElement(direccion, "codigoMunicipio").text = cod_mun
    else:
        nom_mun = persona["nombreMunicipio"]
        if nom_mun:
            ET.SubElement(direccion, "nombreMunicipio").text = nom_mun

    cp = persona["codigoPostal"]
    if cp:
        ET.SubElement(direccion, "codigoPostal").text = cp

    ET.SubElement(direccion, "pais").text = pais if pais else "ESP"

    return direccion


def build_persona(persona):
    """Build a persona element."""
    elem = ET.Element("persona")

    ET.SubElement(elem, "rol").text = "VI"
    ET.SubElement(elem, "nombre").text = persona["nombre"]

    ap1 = persona["apellido1"]
    if ap1:
        ET.SubElement(elem, "apellido1").text = ap1

    ap2 = persona["apellido2"]
    if ap2:
        ET.SubElement(elem, "apellido2").text = ap2

    num_doc = persona["numeroDocumento"]
    tipo_raw = persona["tipoDocumento_raw"]
    if tipo_raw:
        tipo_doc = tipo_raw
    else:
        tipo_doc = detect_tipo_documento(num_doc)

    if tipo_doc and num_doc:
        ET.SubElement(elem, "tipoDocumento").text = tipo_doc
        ET.SubElement(elem, "numeroDocumento").text = num_doc
        sop = persona["soporteDocumento"]
        if sop and tipo_doc in ("NIF", "NIE"):
            ET.SubElement(elem, "soporteDocumento").text = sop
    elif num_doc:
        ET.SubElement(elem, "numeroDocumento").text = num_doc

    fnac = persona["fechaNacimiento"]
    ET.SubElement(elem, "fechaNacimiento").text = fmt_date(fnac if fnac else FECHA_NACIMIENTO_DEFAULT)

    pais = persona["pais"]
    if pais:
        ET.SubElement(elem, "nacionalidad").text = pais if pais else "ESP"

    elem.append(build_direccion(persona))

    correo = persona["correo"]
    if correo:
        ET.SubElement(elem, "correo").text = correo

    parentesco = persona["parentesco"]
    if parentesco:
        ET.SubElement(elem, "parentesco").text = parentesco

    return elem


def build_pago():
    """Build pago block with default values."""
    pago = ET.Element("pago")
    ET.SubElement(pago, "tipoPago").text = "OTRO"
    return pago


def build_contrato(group):
    """Build the contrato block."""
    contrato = ET.Element("contrato")

    ET.SubElement(contrato, "referencia").text = group.get("referencia", "")

    fecha_entrada = group["fechaEntrada"]
    ET.SubElement(contrato, "fechaContrato").text = fmt_date(fecha_entrada)
    ET.SubElement(contrato, "fechaEntrada").text = fmt_datetime(fecha_entrada)
    ET.SubElement(contrato, "fechaSalida").text = fmt_datetime(group["fechaSalida"])

    num = str(len(group["personas"]))
    ET.SubElement(contrato, "numPersonas").text = num

    ET.SubElement(contrato, "numHabitaciones").text = "3"
    ET.SubElement(contrato, "internet").text = "true"

    contrato.append(build_pago())

    return contrato


def build_xml(groups):
    """Build the complete XML document.
    Single solicitud, multiple comunicacion blocks."""
    root = ET.Element("peticion")

    solicitud = ET.SubElement(root, "solicitud")
    ET.SubElement(solicitud, "codigoEstablecimiento").text = CODIGO_ESTABLECIMIENTO

    sorted_refs = sorted(groups.keys(), key=lambda r: groups[r]["fechaEntrada"])

    for ref in sorted_refs:
        group = groups[ref]
        group["referencia"] = ref

        comunicacion = ET.SubElement(solicitud, "comunicacion")
        comunicacion.append(build_contrato(group))

        for persona in group["personas"]:
            comunicacion.append(build_persona(persona))

    return root


def prettify_xml(root):
    """Return pretty-printed XML string with correct namespace."""
    rough = ET.tostring(root, encoding="unicode")
    dom = minidom.parseString(rough)
    pretty = dom.toprettyxml(indent="  ")
    lines = pretty.splitlines()
    if lines and lines[0].startswith("<?xml"):
        lines = lines[1:]
    xml_str = "\n".join(lines)
    xml_str = xml_str.replace(
        "<peticion>",
        '<ns2:peticion xmlns:ns2="%s">' % NS
    )
    xml_str = xml_str.replace("</peticion>", "</ns2:peticion>")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml_str


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

# geoTotal — Copyright 2026 alessandrocdrx
# SPDX-License-Identifier: Apache-2.0
"""Gera o ícone adaptativo do app (fundo, frente e monocromático) como VectorDrawable,
mais uma prévia em SVG. Uso: python3 scripts/gerar-icone.py [pasta-da-previa]

Coordenadas no espaço de 108x108 do ícone adaptativo; a zona sempre visível é o
círculo de raio 33 no centro (54, 54).
"""
import math
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res', 'drawable')
C = 54.0


def circle(cx, cy, r):
    return f'M{cx - r:g},{cy:g}a{r:g},{r:g} 0 1,0 {2 * r:g},0a{r:g},{r:g} 0 1,0 {-2 * r:g},0Z'


def ellipse(cx, cy, rx, ry):
    return f'M{cx - rx:g},{cy:g}a{rx:g},{ry:g} 0 1,0 {2 * rx:g},0a{rx:g},{ry:g} 0 1,0 {-2 * rx:g},0Z'


def arc(cx, cy, rx, ry, top):
    # metade de cima (atrás do globo) ou de baixo (na frente)
    if top:
        return f'M{cx - rx:g},{cy:g}A{rx:g},{ry:g} 0 0,1 {cx + rx:g},{cy:g}'
    return f'M{cx + rx:g},{cy:g}A{rx:g},{ry:g} 0 0,1 {cx - rx:g},{cy:g}'


def sparkle(x, y, s):
    k = s * 0.22
    return (f'M{x:g},{y - s:g}Q{x + k:g},{y - k:g} {x + s:g},{y:g}'
            f'Q{x + k:g},{y + k:g} {x:g},{y + s:g}Q{x - k:g},{y + k:g} {x - s:g},{y:g}'
            f'Q{x - k:g},{y - k:g} {x:g},{y - s:g}Z')


def lin(x1, y1, x2, y2, *stops):
    return ('linear', (x1, y1, x2, y2), stops)


def rad(cx, cy, r, *stops):
    return ('radial', (cx, cy, r), stops)


def P(d, fill=None, stroke=None, sw=0, cap=None):
    return {'t': 'path', 'd': d, 'fill': fill, 'stroke': stroke, 'sw': sw, 'cap': cap}


def G(children, clip=None, rot=None):
    return {'t': 'group', 'c': children, 'clip': clip, 'rot': rot}


# ---------------------------------------------------------------- desenho
R = 24.5          # raio do globo
TILT = -22        # inclinação do anel orbital
RX, RY = 31, 9

GLOBE = circle(C, C, R)

continents = [
    # América do Norte
    'M29.8,40.2C31.6,35.4 36.6,32.2 42.2,31.8C46.4,31.6 49.6,33 48.8,35.6C48.2,37.6 45.6,37.8 44.6,39.8'
    'C43.8,41.6 45.2,43.8 43.4,45.6C41.8,47.2 39.4,46.2 38.2,47.8C37,49.2 35.2,48.6 34.4,46.8'
    'C33.6,44.8 30.6,44.4 29.8,40.2Z',
    # Groenlândia
    'M50.4,31.2C52.4,30 56.2,30 57.4,31.6C58,33 55.6,34.6 53.4,34.4C51.4,34.2 49.8,32.6 50.4,31.2Z',
    # América do Sul
    'M39.6,50.2C42.6,48.4 47.2,49 50.2,51.4C53,53.6 55.6,55 54.6,58.6C53.8,61.8 51,63.4 49.8,67'
    'C48.8,70.4 47.2,74 45.4,77.8C44.4,74.2 43.6,70.4 42.8,66.8C41.8,63.2 38.6,60.8 37.8,57.2'
    'C37.2,54.4 37.4,51.6 39.6,50.2Z',
    # Europa
    'M60.2,40.6C61.4,37.6 64.8,35.6 68.6,35.8C71.8,36 73.6,37.8 72,39.6C70.6,41 67.6,40.8 66.2,42.2'
    'C64.6,43.6 61,43.2 60.2,40.6Z',
    # África
    'M59.4,46.4C62.6,44.2 68.2,44 72.2,45.8C75.4,47.4 76.8,50.4 75.4,53.4C74.2,56 72.2,57.8 71.2,61'
    'C70.2,64.6 68.2,69 64.6,72.2C63,68.8 62.6,65 61.8,61.6C61.2,58.8 58,56.8 57.4,53.2'
    'C57,50.4 57.6,47.6 59.4,46.4Z',
    # Madagascar
    'M73.4,63.2C74.4,62.2 75.8,62.8 75.4,64.4C75,66.2 73.8,67.8 73,67C72.4,66.2 72.8,64.2 73.4,63.2Z',
]

grid = []
for rx in (R * 0.42, R * 0.78):
    grid.append(ellipse(C, C, rx, R))
grid.append(f'M{C:g},{C - R:g}V{C + R:g}')
for f in (-0.62, -0.3, 0, 0.3, 0.62):
    y = C + f * R
    half = math.sqrt(R * R - (f * R) ** 2)
    grid.append(f'M{C - half:.2f},{y:.2f}H{C + half:.2f}')

PIN_X, PIN_Y = 47.2, 57.5   # Brasília
pin = (f'M{PIN_X:g},{PIN_Y - 9:g}C{PIN_X - 3.4:g},{PIN_Y - 9:g} {PIN_X - 5.6:g},{PIN_Y - 6.6:g} {PIN_X - 5.6:g},{PIN_Y - 3.6:g}'
       f'C{PIN_X - 5.6:g},{PIN_Y + 0.4:g} {PIN_X:g},{PIN_Y + 5.2:g} {PIN_X:g},{PIN_Y + 5.2:g}'
       f'C{PIN_X:g},{PIN_Y + 5.2:g} {PIN_X + 5.6:g},{PIN_Y + 0.4:g} {PIN_X + 5.6:g},{PIN_Y - 3.6:g}'
       f'C{PIN_X + 5.6:g},{PIN_Y - 6.6:g} {PIN_X + 3.4:g},{PIN_Y - 9:g} {PIN_X:g},{PIN_Y - 9:g}Z')

# satélite / cometa no anel (ângulo na elipse, antes da rotação)
SAT_T = math.radians(28)
SAT_X, SAT_Y = C + RX * math.cos(SAT_T), C + RY * math.sin(SAT_T)

RING = lin(C - RX, C, C + RX, C, (0, '#ffd166', 1), (0.55, '#ff9f43', 1), (1, '#ff4f8b', 1))

background = [
    P('M0,0H108V108H0Z', fill=rad(38, 30, 96, (0, '#2a2f8f', 1), (0.45, '#141a52', 1), (1, '#05071a', 1))),
    P(circle(78, 26, 30), fill=rad(78, 26, 30, (0, '#b57cff', 0.35), (1, '#b57cff', 0))),
    P(circle(24, 86, 28), fill=rad(24, 86, 28, (0, '#22d3ee', 0.22), (1, '#22d3ee', 0))),
] + [P(sparkle(x, y, s), fill='#ffffff') for x, y, s in
     ((18, 20, 2.2), (90, 16, 1.6), (94, 72, 2.4), (14, 58, 1.4), (84, 94, 1.5), (30, 100, 1.2), (66, 10, 1.1))] \
  + [P(circle(x, y, r), fill='#dfe7ff') for x, y, r in
     ((26, 30, 0.6), (40, 12, 0.5), (100, 44, 0.6), (8, 40, 0.5), (60, 100, 0.6), (100, 100, 0.5), (8, 96, 0.6), (74, 86, 0.4))]

foreground = [
    # brilho da atmosfera
    P(circle(C, C, R + 7.5), fill=rad(C, C, R + 7.5, (0.72, '#4fc3ff', 0.55), (1, '#4fc3ff', 0))),
    # metade de trás do anel
    G([P(arc(C, C, RX, RY, True), stroke=lin(C - RX, C, C + RX, C, (0, '#ffd166', 0.45), (1, '#ff4f8b', 0.45)), sw=1.6, cap='round')],
      rot=(TILT, C, C)),
    # oceano
    P(GLOBE, fill=rad(C - 9, C - 10, R * 1.55, (0, '#7fe0ff', 1), (0.35, '#1f8fe0', 1), (0.75, '#0c4aa6', 1), (1, '#061c52', 1))),
    G([
        P(' '.join(grid), stroke='#7fbbe8', sw=0.4),
        *[P(d, fill=lin(40, 32, 70, 76, (0, '#8dffb4', 1), (0.5, '#2fd67f', 1), (1, '#138a52', 1))) for d in continents],
        # sombra (lado noturno)
        P(circle(C + 9, C + 8, R * 1.05), fill=rad(C + 16, C + 15, R * 1.35, (0, '#020617', 0.72), (0.6, '#020617', 0.35), (1, '#020617', 0))),
        # reflexo
        P(ellipse(C - 9, C - 11, 8.5, 5.5), fill=rad(C - 9, C - 11, 8.5, (0, '#ffffff', 0.55), (1, '#ffffff', 0))),
    ], clip=GLOBE),
    # borda luminosa
    P(GLOBE, stroke=lin(C - R, C - R, C + R, C + R, (0, '#bff1ff', 0.9), (0.5, '#4fc3ff', 0.35), (1, '#4fc3ff', 0)), sw=0.9),
    # metade da frente do anel + satélite
    G([
        P(arc(C, C, RX, RY, False), stroke=RING, sw=2.4, cap='round'),
        P(circle(SAT_X, SAT_Y, 4.2), fill=rad(SAT_X, SAT_Y, 4.2, (0, '#fff4c2', 0.95), (1, '#ffd166', 0))),
        P(sparkle(SAT_X, SAT_Y, 3.4), fill='#ffffff'),
    ], rot=(TILT, C, C)),
    # alfinete da capital
    P(circle(PIN_X, PIN_Y + 5.2, 2.6), fill=rad(PIN_X, PIN_Y + 5.2, 2.6, (0, '#000000', 0.45), (1, '#000000', 0))),
    P(pin, fill=lin(PIN_X, PIN_Y - 9, PIN_X, PIN_Y + 5, (0, '#ff7a8a', 1), (1, '#d7263d', 1)), stroke='#ffffff', sw=0.9),
    P(circle(PIN_X, PIN_Y - 3.7, 1.9), fill='#ffffff'),
]

monochrome = [
    P(GLOBE, stroke='#000000', sw=2.2),
    G([P(' '.join(grid), stroke='#000000', sw=1.0),
       *[P(d, fill='#000000') for d in continents]], clip=GLOBE),
    G([P(arc(C, C, RX, RY, False), stroke='#000000', sw=2.4, cap='round')], rot=(TILT, C, C)),
    P(pin, fill='#000000'),
]


# ---------------------------------------------------------------- saída
def hexa(color, alpha):
    return '#%02x%s' % (round(alpha * 255), color[1:])


def vd_grad(g, attr, ind):
    kind, geo, stops = g
    if kind == 'linear':
        a = f'android:type="linear" android:startX="{geo[0]:g}" android:startY="{geo[1]:g}" android:endX="{geo[2]:g}" android:endY="{geo[3]:g}"'
    else:
        a = f'android:type="radial" android:centerX="{geo[0]:g}" android:centerY="{geo[1]:g}" android:gradientRadius="{geo[2]:g}"'
    items = ''.join(f'{ind}    <item android:offset="{o:g}" android:color="{hexa(c, al)}" />\n' for o, c, al in stops)
    return (f'{ind}<aapt:attr name="android:{attr}">\n{ind}  <gradient {a}>\n'
            f'{items.replace(ind + "    ", ind + "    ")}{ind}  </gradient>\n{ind}</aapt:attr>\n')


def vd_node(n, ind):
    if n['t'] == 'group':
        attrs = ''
        if n['rot']:
            r, px, py = n['rot']
            attrs = f' android:rotation="{r:g}" android:pivotX="{px:g}" android:pivotY="{py:g}"'
        out = f'{ind}<group{attrs}>\n'
        if n['clip']:
            out += f'{ind}  <clip-path android:pathData="{n["clip"]}" />\n'
        for c in n['c']:
            out += vd_node(c, ind + '  ')
        return out + f'{ind}</group>\n'
    attrs = [f'android:pathData="{n["d"]}"']
    kids = ''
    for key, attr in (('fill', 'fillColor'), ('stroke', 'strokeColor')):
        v = n[key]
        if isinstance(v, str):
            attrs.append(f'android:{attr}="{v}"')
        elif v:
            kids += vd_grad(v, attr, ind + '  ')
    if n['stroke']:
        attrs.append(f'android:strokeWidth="{n["sw"]:g}"')
        if n['cap']:
            attrs.append(f'android:strokeLineCap="{n["cap"]}"')
    if not kids:
        return f'{ind}<path {" ".join(attrs)} />\n'
    return f'{ind}<path {" ".join(attrs)}>\n{kids}{ind}</path>\n'


def vector(nodes, comment):
    body = ''.join(vd_node(n, '    ') for n in nodes)
    return ('<?xml version="1.0" encoding="utf-8"?>\n'
            f'<!-- {comment} Gerado por scripts/gerar-icone.py; edite o script, não este arquivo. -->\n'
            '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n'
            '    xmlns:aapt="http://schemas.android.com/aapt"\n'
            '    android:width="108dp"\n    android:height="108dp"\n'
            '    android:viewportWidth="108"\n    android:viewportHeight="108">\n'
            f'{body}</vector>\n')


def svg_nodes(nodes):
    defs, out, n_id = [], [], [0]

    def grad(g):
        n_id[0] += 1
        gid = f'g{n_id[0]}'
        kind, geo, stops = g
        st = ''.join(f'<stop offset="{o:g}" stop-color="{c}" stop-opacity="{al:g}"/>' for o, c, al in stops)
        if kind == 'linear':
            defs.append(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{geo[0]:g}" y1="{geo[1]:g}" x2="{geo[2]:g}" y2="{geo[3]:g}">{st}</linearGradient>')
        else:
            defs.append(f'<radialGradient id="{gid}" gradientUnits="userSpaceOnUse" cx="{geo[0]:g}" cy="{geo[1]:g}" r="{geo[2]:g}">{st}</radialGradient>')
        return f'url(#{gid})'

    def node(n):
        if n['t'] == 'group':
            a = ''
            if n['rot']:
                a += ' transform="rotate(%g %g %g)"' % n['rot']
            if n['clip']:
                n_id[0] += 1
                defs.append(f'<clipPath id="c{n_id[0]}"><path d="{n["clip"]}"/></clipPath>')
                a += f' clip-path="url(#c{n_id[0]})"'
            return f'<g{a}>' + ''.join(node(c) for c in n['c']) + '</g>'
        f = n['fill'] if isinstance(n['fill'], str) else (grad(n['fill']) if n['fill'] else 'none')
        s = n['stroke'] if isinstance(n['stroke'], str) else (grad(n['stroke']) if n['stroke'] else 'none')
        extra = f' stroke-width="{n["sw"]:g}"' if n['stroke'] else ''
        if n['cap']:
            extra += f' stroke-linecap="{n["cap"]}"'
        return f'<path d="{n["d"]}" fill="{f}" stroke="{s}"{extra}/>'

    body = ''.join(node(n) for n in nodes)
    return '<defs>' + ''.join(defs) + '</defs>' + body


def main():
    files = {
        'ic_launcher_background.xml': vector(background, 'Fundo do ícone: céu estrelado.'),
        'ic_launcher_foreground.xml': vector(foreground, 'Frente do ícone: globo com anel orbital e alfinete da capital.'),
        'ic_launcher_monochrome.xml': vector(monochrome, 'Ícone temático (Android 13+), só a silhueta.'),
    }
    for name, xml in files.items():
        with open(os.path.join(RES, name), 'w', encoding='utf-8') as f:
            f.write(xml)
        print('Gerado', name)
    if len(sys.argv) > 1:
        prev = sys.argv[1]
        for name, nodes in (('fundo', background), ('frente', foreground), ('mono', monochrome)):
            with open(os.path.join(prev, f'icone-{name}.svg'), 'w', encoding='utf-8') as f:
                f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">' + svg_nodes(nodes) + '</svg>')


if __name__ == '__main__':
    main()

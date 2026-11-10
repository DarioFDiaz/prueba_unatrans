# Análisis de operaciones

Aplicación web para cargar un Excel, filtrarlo y revisar la tabla, el estado, la rentabilidad por zona y el margen de una operación.

## Requisitos

- [Node.js](https://nodejs.org/) 20.19 o superior (también sirve Node 22)
- npm, que viene incluido con Node.js

Para comprobar que quedaron instalados:

```bash
node -v
npm -v
```

## Ejecutar en una computadora nueva

Estas carpetas no viajan con el repositorio: `node_modules` y `dist`. Hay que instalar las dependencias en cada computadora.

1. Clona el repositorio y entra a la carpeta del proyecto.

```bash
git clone <url-del-repositorio>
cd prueba_unatrans
```

2. Instala las dependencias.

```bash
npm install
```

3. Inicia la aplicación.

```bash
npm run dev
```

4. Abre en el navegador la dirección que muestra la terminal, normalmente http://localhost:5173/.

Para detenerla, presiona `Ctrl + C` en esa terminal.

## Probarla

En la raíz está `ejemplo_operaciones.xlsx`. En la pantalla inicial arrástralo o selecciónalo. También puedes usar otro Excel.

El archivo debe traer estas columnas:

- `Zona`
- `Tipo_Servicio`
- `Estado`
- `ID_Operacion`
- `Ingresos_COP`
- `Costos_COP`
- `Margen_COP`

Las demás columnas pueden variar: la tabla las muestra todas, en el orden del Excel. Si hay varias hojas, se carga la primera.

## Generar la versión para publicar

```bash
npm run build
npm run preview
```

`npm run build` crea la carpeta `dist`. `npm run preview` sirve esa versión en local para revisarla.

import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const raiz = path.resolve(__dirname, "..");
const pastaImagens = path.join(raiz, "imagens");
const saida = path.join(raiz, "galerias.js");

const extensoesPermitidas = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"
]);

async function listarGalerias() {
  const galerias = {};
  const entradas = await readdir(pastaImagens, { withFileTypes: true });

  const pastas = entradas
    .filter(item => item.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  for (const pasta of pastas) {
    const caminhoPasta = path.join(pastaImagens, pasta.name);
    const arquivos = await readdir(caminhoPasta, { withFileTypes: true });

    const imagens = arquivos
      .filter(item => item.isFile())
      .map(item => item.name)
      .filter(nome => extensoesPermitidas.has(path.extname(nome).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));

    if (imagens.length > 0) {
      galerias[pasta.name] = imagens;
    }
  }

  return galerias;
}

const galerias = await listarGalerias();

const conteudo =
`// ARQUIVO GERADO AUTOMATICAMENTE.
// Não edite manualmente. O build recria este arquivo antes da publicação.
window.PORTFOLIO_GALLERIES = ${JSON.stringify(galerias, null, 2)};
`;

await writeFile(saida, conteudo, "utf8");

console.log(
  `galerias.js gerado com ${Object.keys(galerias).length} galeria(s).`
);

# Portfólio Caderno 3D — GitHub Pages

Projeto em HTML, CSS e JavaScript puro, preparado para publicação automática no **GitHub Pages**.

## O que esta versão possui

- Capa editorial com animações leves.
- Páginas com efeito de folhear por arraste, swipe ou setas.
- Sumário clicável que leva diretamente a cada galeria.
- Botões rápidos para voltar à capa e ao sumário.
- Barra de progresso e identificação da página atual.
- Imagens clicáveis em visualização fullscreen, com botão de fechar e suporte à tecla `Esc`.
- Layout responsivo para computador, tablet e celular.
- Navegação por teclado (`←`, `→`, `PageUp`, `PageDown` e `Home`).
- Respeito à preferência do sistema por movimento reduzido.
- Deploy automático no GitHub Pages via GitHub Actions.
- Compatível com URLs do tipo `usuario.github.io/repositorio/` porque os assets usam caminhos relativos.

## Estrutura

```text
portfolio-caderno-3d/
├─ .github/
│  └─ workflows/
│     └─ deploy-pages.yml
├─ index.html
├─ styles.css
├─ app.js
├─ galerias.js
├─ package.json
├─ scripts/
│  └─ gerar-galerias.mjs
└─ imagens/
   ├─ design/
   ├─ fotografia/
   └─ web/
```

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório.
3. Use a branch `main`.
4. No GitHub, abra **Settings → Pages**.
5. Em **Build and deployment**, selecione **GitHub Actions** como fonte.
6. Faça um push na `main` ou execute manualmente o workflow **Deploy GitHub Pages** em **Actions**.

O workflow irá:

1. gerar novamente `galerias.js` a partir das pastas de `imagens/`;
2. montar apenas os arquivos necessários em `_site/`;
3. publicar esse conteúdo no GitHub Pages.

## Para adicionar uma nova galeria

Crie uma nova pasta dentro de `imagens/` e coloque as fotos nela.

Exemplo:

```text
imagens/
└─ formatura/
   ├─ 01.jpg
   ├─ 02.jpg
   └─ 03.jpg
```

Depois faça commit e push. O GitHub Actions detectará a nova pasta, recriará `galerias.js` e publicará o site novamente.

## Para testar localmente

Com Node instalado:

```bash
npm run build
```

Depois abra `index.html` no navegador.

## Observações importantes

- Não use caminhos iniciando com `/` para CSS, JavaScript ou imagens; este projeto já está configurado com caminhos relativos.
- Não é necessário Netlify.
- O arquivo `galerias.js` é gerado automaticamente. Evite editá-lo manualmente.
- O deploy está configurado para a branch `main`. Se usar outro nome de branch, altere `.github/workflows/deploy-pages.yml`.

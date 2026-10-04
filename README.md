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

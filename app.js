const express = require("express");
const bodyParser = require("body-parser");
const produtosRoutes = require("./routerProdutos.js");
const usuariosRoutes = require("./routerUsuarios.js");

const port = 3000;

const path = require("path");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas para servir arquivos estáticos
app.use(express.static(__dirname + "/../frontend"));
app.use(express.static(__dirname + "/../frontend/pages"));
app.use(express.static(__dirname + "/../frontend/pages/login"));

// ENDEREÇO DAS PÁGINAS DE PRODUTOS
app.get("/produto/lista", function (req, res) {
  res.sendFile(
    path.join(__dirname, "..", "frontend", "pages", "produto", "lista.html")
  );
});

app.get("/usuarios/produto", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "frontend", "pages", "produto"));
});
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "frontend", "confirmar.html"));
});

// Rotas de produtos
app.use("/produtos", produtosRoutes);
app.use("/usuarios", usuariosRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});

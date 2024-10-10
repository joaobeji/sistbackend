const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000; // Porta fornecida pelo host ou 3000
const HOST = "0.0.0.0"; // Aceitar conexões de qualquer lugar

// Configuração do express-session
app.use(
  session({
    secret: process.env.SECRET_KEY, // Use uma string segura para a chave secreta
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // `secure: true` se for usar HTTPS em produção
  })
);

app.use("/img", express.static(path.join(__dirname, "/img")));

// Configuração do motor de visualização EJS
app.set("view engine", "ejs");

// Middleware para processar os dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Rota principal para renderizar os cards
app.get("/", (req, res) => {
  const query = `
    SELECT c.id, c.titulo, c.descricao, c.categoria, c.imagem_url, c.tempo_preparo, c.rendimento,
           GROUP_CONCAT(mp.descricao ORDER BY mp.passo_numero ASC SEPARATOR '|') AS passos
    FROM comidas c
    LEFT JOIN modos_preparo mp ON c.id = mp.comida_id
    GROUP BY c.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar as receitas:", err);
      res.status(500).send("Erro ao buscar as receitas");
      return;
    }
    res.render("index", { comidas: results });
  });
});

// Rota para exibir o formulário de cadastro de receitas
app.get("/cadastrar", (req, res) => {
  res.render("cadastrar"); // renderiza a página cadastrar.ejs
});

// Rota para processar o cadastro de receitas
app.post("/cadastrar", (req, res) => {
  const {
    titulo,
    descricao,
    categoria,
    imagem_url,
    tempo_preparo,
    rendimento,
  } = req.body;

  const query = `
    INSERT INTO comidas (titulo, descricao, categoria, imagem_url, tempo_preparo, rendimento)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [titulo, descricao, categoria, imagem_url, tempo_preparo, rendimento],
    (err) => {
      if (err) {
        console.error("Erro ao cadastrar a receita:", err);
        res.status(500).send("Erro ao cadastrar a receita");
        return;
      }
      res.redirect("/listar-receitas"); // Redireciona para a página principal após o cadastro
    }
  );
});

// Rota para exibir o formulário de cadastro de ingredientes
app.get("/cadastrar-ingrediente", (req, res) => {
  const query = "SELECT id, titulo FROM comidas";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar as receitas:", err);
      res.status(500).send("Erro ao buscar as receitas");
      return;
    }
    res.render("cadastrar_ingrediente", { comidas: results });
  });
});

// Rota para processar o cadastro de ingredientes
app.post("/cadastrar-ingrediente", (req, res) => {
  const { comida_id, descricao, quantidade, unidade } = req.body;

  const query = `
    INSERT INTO ingredientes (comida_id, descricao, quantidade, unidade)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [comida_id, descricao, quantidade, unidade], (err) => {
    if (err) {
      console.error("Erro ao cadastrar o ingrediente:", err);
      res.status(500).send("Erro ao cadastrar o ingrediente");
      return;
    }
    res.redirect("/listar-ingredientes");// Redireciona para a página principal após o cadastro
  });
});

// Rota para exibir o formulário de cadastro de modos de preparo
app.get("/cadastrar-modo-preparo", (req, res) => {
  const query = "SELECT id, titulo FROM comidas";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar as receitas:", err);
      res.status(500).send("Erro ao buscar as receitas");
      return;
    }
    res.render("cadastrar_modo_preparo", { comidas: results });
  });
});

// Rota para processar o cadastro de modos de preparo
app.post("/cadastrar-modo-preparo", (req, res) => {
  const { comida_id, descricao, passo_numero } = req.body;

  const query = `
    INSERT INTO modos_preparo (comida_id, descricao, passo_numero)
    VALUES (?, ?, ?)
  `;

  db.query(query, [comida_id, descricao, passo_numero], (err) => {
    if (err) {
      console.error("Erro ao cadastrar o modo de preparo:", err);
      res.status(500).send("Erro ao cadastrar o modo de preparo");
      return;
    }
    res.redirect("/listar-modos-preparo"); // Redireciona para a página principal após o cadastro
  });
});

// Rota para listar todas as receitas
app.get("/listar-receitas", (req, res) => {
  const query = `
    SELECT c.id, c.titulo, c.descricao, c.categoria, c.imagem_url, c.tempo_preparo, c.rendimento,
           GROUP_CONCAT(mp.descricao ORDER BY mp.passo_numero ASC SEPARATOR '|') AS passos
    FROM comidas c
    LEFT JOIN modos_preparo mp ON c.id = mp.comida_id
    GROUP BY c.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar as receitas:", err);
      res.status(500).send("Erro ao buscar as receitas");
      return;
    }
    res.render("listar_receitas", { comidas: results });
  });
});

// Rota para listar todos os ingredientes
app.get("/listar-ingredientes", (req, res) => {
  const query = "SELECT * FROM ingredientes";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar os ingredientes:", err);
      res.status(500).send("Erro ao buscar os ingredientes");
      return;
    }
    res.render("listar_ingredientes", { ingredientes: results });
  });
});

// Rota para listar todos os modos de preparo
app.get("/listar-modos-preparo", (req, res) => {
  const query = "SELECT * FROM modos_preparo";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar os modos de preparo:", err);
      res.status(500).send("Erro ao buscar os modos de preparo");
      return;
    }
    res.render("listar_modos_preparo", { modosPreparo: results });
  });
});

/* ROTAS DE USUÁRIOS */
// Rota de Cadastrar
app.post("/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).send("Erro ao verificar usuário");
      }

      if (results.length > 0) {
        return res.status(400).send("Usuário já cadastrado");
      }

      bcrypt.hash(senha, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).send("Erro ao criptografar a senha");
        }

        db.query(
          "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
          [nome, email, hashedPassword],
          (err, results) => {
            if (err) {
              return res.status(500).send("Erro ao cadastrar");
            }

            // Redireciona após 5 segundos
            res.send(`
              <html>
                <head>
                  <meta http-equiv="refresh" content="5; url=/" />
                </head>
                <body>
                  <h1>Cadastro realizado com sucesso!</h1>
                  <p>Você será redirecionado para a página principal em 5 segundos.</p>
                </body>
              </html>
            `);
          }
        );
      });
    }
  );
});

// Rota de Login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        return res.status(500).send("Erro no servidor");
      }

      if (results.length === 0) {
        return res.status(400).send("Usuário não encontrado");
      }

      const user = results[0];

      bcrypt.compare(senha, user.senha, (err, match) => {
        if (err) {
          return res.status(500).send("Erro ao verificar senha");
        }

        if (!match) {
          return res.status(400).send("Senha incorreta");
        }

        // Aqui, armazene o nome do usuário na sessão
        req.session.user = {
          id: user.id,
          nome: user.nome, // Certifique-se de que o campo nome existe na tabela
          email: user.email,
        };

        res.redirect("/dashboard");
      });
    }
  );
});

app.get("/dashboard", (req, res) => {
  // Verifique se o usuário está autenticado
  if (req.session.user) {
    res.render("dashboard", { user: req.session.user });
  } else {
    res.redirect("/");
  }
});

// Rota para editar uma receita
app.get("/editar-receita/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM comidas WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar a receita para editar:", err);
      res.status(500).send("Erro ao buscar a receita");
      return;
    }
    res.render("editar_receita", { receita: results[0] }); // Crie um arquivo editar_receita.ejs
  });
});

// Rota para atualizar uma receita
app.post("/atualizar-receita/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, categoria, imagem_url, tempo_preparo, rendimento } = req.body;

  const query = `
    UPDATE comidas SET titulo = ?, descricao = ?, categoria = ?, imagem_url = ?, tempo_preparo = ?, rendimento = ?
    WHERE id = ?
  `;

  db.query(query, [titulo, descricao, categoria, imagem_url, tempo_preparo, rendimento, id], (err) => {
    if (err) {
      console.error("Erro ao atualizar a receita:", err);
      res.status(500).send("Erro ao atualizar a receita");
      return;
    }
    res.redirect("/listar-receitas"); // Redireciona após a atualização
  });
});

// Rota para deletar uma receita
app.post("/deletar-receita/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM comidas WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      console.error("Erro ao deletar a receita:", err);
      res.status(500).send("Erro ao deletar a receita");
      return;
    }
    res.redirect("/listar-receitas"); // Redireciona após a deleção
  });
});

// Rota para editar um ingrediente
app.get("/editar-ingrediente/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM ingredientes WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar o ingrediente para editar:", err);
      res.status(500).send("Erro ao buscar o ingrediente");
      return;
    }
    res.render("editar_ingrediente", { ingrediente: results[0] }); // Crie um arquivo editar_ingrediente.ejs
  });
});

// Rota para atualizar um ingrediente
app.post("/atualizar-ingrediente/:id", (req, res) => {
  const { id } = req.params;
  const { comida_id, descricao, quantidade, unidade } = req.body;

  const query = `
    UPDATE ingredientes SET comida_id = ?, descricao = ?, quantidade = ?, unidade = ?
    WHERE id = ?
  `;

  db.query(query, [comida_id, descricao, quantidade, unidade, id], (err) => {
    if (err) {
      console.error("Erro ao atualizar o ingrediente:", err);
      res.status(500).send("Erro ao atualizar o ingrediente");
      return;
    }
    res.redirect("/listar-ingredientes"); // Redireciona após a atualização
  });
});

// Rota para deletar um ingrediente
app.post("/deletar-ingrediente/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM ingredientes WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      console.error("Erro ao deletar o ingrediente:", err);
      res.status(500).send("Erro ao deletar o ingrediente");
      return;
    }
    res.redirect("/listar-ingredientes"); // Redireciona após a deleção
  });
});

// Rota para editar um modo de preparo
app.get("/editar-modo-preparo/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM modos_preparo WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Erro ao buscar o modo de preparo para editar:", err);
      res.status(500).send("Erro ao buscar o modo de preparo");
      return;
    }
    res.render("editar_modo_preparo", { modo: results[0] }); // Crie um arquivo editar_modo_preparo.ejs
  });
});

// Rota para atualizar um modo de preparo
app.post("/atualizar-modo-preparo/:id", (req, res) => {
  const { id } = req.params;
  const { comida_id, descricao, passo_numero } = req.body;

  const query = `
    UPDATE modos_preparo SET comida_id = ?, descricao = ?, passo_numero = ?
    WHERE id = ?
  `;

  db.query(query, [comida_id, descricao, passo_numero, id], (err) => {
    if (err) {
      console.error("Erro ao atualizar o modo de preparo:", err);
      res.status(500).send("Erro ao atualizar o modo de preparo");
      return;
    }
    res.redirect("/listar-modos-preparo"); // Redireciona após a atualização
  });
});

// Rota para deletar um modo de preparo
app.post("/deletar-modo-preparo/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM modos_preparo WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      console.error("Erro ao deletar o modo de preparo:", err);
      res.status(500).send("Erro ao deletar o modo de preparo");
      return;
    }
    res.redirect("/listar-modos-preparo"); // Redireciona após a deleção
  });
});




// Iniciar o servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor: ${HOST} rodando na porta: ${PORT}`);
});

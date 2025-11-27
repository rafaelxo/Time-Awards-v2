# 💻 Documentação Técnica - TimeAwards

> **Guia completo de desenvolvimento, arquitetura e implementação do código-fonte**

Este documento detalha a **estrutura técnica**, **padrões de projeto**, **decisões arquiteturais** e **fluxos de desenvolvimento** do sistema TimeAwards. Destinado a desenvolvedores que precisam entender, modificar ou dar manutenção no código.

📌 **Para visão geral do projeto** (funcionalidades, instalação, equipe): [README Principal](../README.md)

## 📁 Estrutura de Diretórios

```plaintext
Codigo/
├── 📂 src/main/
│   ├── 📂 java/                           # Backend Java
│   │   ├── 📂 app/
│   │   │   └── Aplicacao.java             # 🚀 Entry point, rotas Spark
│   │   ├── 📂 dao/                        # 🗄️ Data Access Objects
│   │   │   ├── DAO.java                   # Classe base abstrata
│   │   │   ├── UsuarioDAO.java            # CRUD usuários + MD5
│   │   │   ├── AtividadeDAO.java          # CRUD atividades + queries
│   │   │   └── RecomendacaoDAO.java       # CRUD recomendações
│   │   ├── 📂 model/                      # 🏗️ Entidades/POJOs
│   │   │   ├── Usuario.java               # 7 atributos + validações
│   │   │   ├── Atividade.java             # 9 atributos + LocalDateTime
│   │   │   └── Recomendacao.java          # 6 atributos + status
│   │   └── 📂 service/                    # 🔧 Lógica de negócio
│   │       ├── NotificacoesService.java   # Email SMTP + agendamentos
│   │       └── RecomendadorService.java   # Azure OpenAI GPT-4o
│   │
│   └── 📂 resources/public/               # Frontend estático
│       ├── 📂 assets/                     # Recursos globais
│       │   ├── 📂 css/
│       │   │   ├── geral.css              # ⭐ Estilos compartilhados
│       │   │   ├── dashboard.css
│       │   │   └── navbar.css
│       │   ├── 📂 js/
│       │   │   ├── dashboard.js           # Lógica + Chart.js
│       │   │   └── navbar.js              # Menu lateral dinâmico
│       │   └── 📂 imagens/
│       │       └── anonimo.png            # Avatar padrão
│       │
│       ├── 📂 modulos/                    # Módulos SPA
│       │   ├── 📂 login/
│       │   │   ├── login.html
│       │   │   ├── login.css
│       │   │   └── login.js               # Autenticação + sessão
│       │   ├── 📂 perfil/
│       │   │   ├── perfil.html
│       │   │   ├── perfil.css
│       │   │   └── perfil.js              # Edição de usuário
│       │   ├── 📂 atividades/
│       │   │   ├── atividades.html
│       │   │   ├── atividades.css
│       │   │   ├── atividades.js          # CRUD principal
│       │   │   └── 📂 ia's/               # 🤖 Inteligências
│       │   │       ├── ia-prompt.js       # GPT-4o interpretação
│       │   │       ├── ia-voz.js          # Speech Recognition
│       │   │       └── ia-foto.js         # Tesseract OCR
│       │   ├── 📂 monitoramento/
│       │   │   ├── monitoramento.html
│       │   │   ├── monitoramento.css
│       │   │   └── monitoramento.js       # Timeline + gráficos
│       │   └── 📂 recomendacoes/
│       │       ├── recomendacoes.html
│       │       ├── recomendacoes.css
│       │       └── recomendacoes.js       # Chamada IA backend
│       │
│       └── dashboard.html                 # 🏠 Página principal
│
├── 📄 pom.xml                             # Dependências Maven
├── 📄 database.sql                        # Schema PostgreSQL completo
├── 📄 .gitignore                          # Exclusões Git
└── 📄 README.md                          # Este arquivo
```

### 📊 Estatísticas do Projeto

- **Total de Arquivos**: ~50
- **Linhas de Código**: ~8.500
- **Backend (Java)**: 19.2%
- **Frontend (JS)**: 28.9%
- **Estilização (CSS)**: 26.2%
- **Marcação (HTML)**: 25.7%

## 🏗️ Arquitetura e Padrões de Projeto

### 📐 Padrão Arquitetural: MVC Modificado

```
┌─────────────┐
│   CLIENTE   │  (Navegador)
│  HTML/CSS/JS│
└──────┬──────┘
       │ HTTP REST (JSON)
       ↓
┌─────────────────────────────────┐
│      SPARK FRAMEWORK            │
│  ┌─────────────────────────┐   │
│  │   Aplicacao.java        │   │  ← Controller (Rotas)
│  │  - get("/usuarios")     │   │
│  │  - post("/atividades")  │   │
│  │  - put("/recomendacoes") │   │
│  └────────┬────────────────┘   │
└───────────┼─────────────────────┘
            ↓
┌───────────────────────────────────┐
│      SERVICE LAYER                │
│  ┌────────────────────────────┐  │
│  │ NotificacoesService        │  │  ← Lógica de negócio
│  │ RecomendadorService (IA)   │  │
│  └────────┬───────────────────┘  │
└───────────┼───────────────────────┘
            ↓
┌───────────────────────────────────┐
│      DAO LAYER                    │
│  ┌────────────────────────────┐  │
│  │ UsuarioDAO                 │  │  ← Persistência
│  │ AtividadeDAO               │  │
│  │ RecomendacaoDAO            │  │
│  └────────┬───────────────────┘  │
└───────────┼───────────────────────┘
            ↓
┌───────────────────────────────────┐
│    PostgreSQL (Azure Cloud)       │
│  - usuario (MD5 hash)             │
│  - atividade (timestamp auto)     │
│  - recomendacao (status boolean)  │
└───────────────────────────────────┘
```

### 🎯 Padrões Utilizados

| Padrão | Onde | Benefício |
|--------|------|-----------|
| **DAO (Data Access Object)** | `dao/DAO.java` | Abstração do acesso a dados, facilita troca de BD |
| **Singleton** | `Aplicacao.java` (instâncias DAO) | Uma única conexão reutilizada |
| **Factory Method** | `carregarEnv()` nos Services | Criação de objetos de configuração |
| **Strategy** | Fallback IA local vs Azure | Troca de algoritmo em runtime |
| **Observer** | `TimerTask` em NotificacoesService | Notificações automáticas agendadas |
| **Template Method** | `DAO.conectar()` herdado | Reutilização de lógica comum |

### 🔄 Fluxo de Dados Completo

**Exemplo: Adicionar Atividade**

```
1. Frontend (atividades.js)
   ↓ fetch('POST /atividades', body)

2. Backend (Aplicacao.java)
   ↓ post("/atividades", (req, res) -> {...})
   ↓ extrair parâmetros do req.body()

3. Model (Atividade.java)
   ↓ new Atividade(usuarioId, nome, classe, ...)

4. DAO (AtividadeDAO.java)
   ↓ inserirAtividade(atividade)
   ↓ PreparedStatement com SQL

5. PostgreSQL
   ↓ INSERT INTO atividade VALUES (...)
   ↓ Trigger calcula metaCumprida

6. Response
   ↓ res.status(201)
   ↓ return gson.toJson(atividade)

7. Frontend
   ↓ atualiza DOM com nova atividade
   ✓ Toast de sucesso
```

## 🔍 Detalhamento das Camadas

### 📦 Model Layer (`model/`)

**POJOs (Plain Old Java Objects)** que representam entidades do banco.

#### `Usuario.java`

```java
public class Usuario {
    private int id;                    // PK autoincrement
    private String nome;               // VARCHAR(255)
    private String login;              // VARCHAR(100) UNIQUE
    private String senha;              // MD5 hash (PostgreSQL)
    private String email;              // VARCHAR(255) UNIQUE
    private String telefone;           // VARCHAR(20)
    private boolean notificacoes;      // BOOLEAN (receber emails)
}
```

**Características:**

- Validação de unicidade (login, email, telefone) no DAO
- Senha **nunca armazenada em plaintext**
- Construtor completo + vazio + getters/setters

#### `Atividade.java`

```java
public class Atividade {
    private int id;
    private int usuarioId;             // FK → usuario.id
    private String nomeAtividade;
    private int classe;                // 1-5 (Trabalho, Estudos, etc)
    private double horasGastas;        // DECIMAL(10,2)
    private int metaHoras;             // Meta diária da classe
    private boolean metaCumprida;      // Calculado: horasGastas >= metaHoras
    private int prioridade;            // 1=Alta, 2=Média, 3=Baixa
    private LocalDateTime dataHora;    // TIMESTAMP com zona
}
```

**Lógica de Negócio:**

- `metaCumprida` auto-calculado por trigger PostgreSQL
- `dataHora` default `CURRENT_TIMESTAMP`
- Metas por classe definidas em constantes (6h, 4h, 2h, 4h, 8h)

#### `Recomendacao.java`

```java
public class Recomendacao {
    private int id;
    private int usuarioId;
    private String titulo;             // VARCHAR(255)
    private String descricao;          // TEXT (longo)
    private int relevancia;            // 1=Baixa, 2=Média, 3=Alta
    private boolean status;            // FALSE=Pendente, TRUE=Concluída
}
```

---

### 🗄️ DAO Layer (`dao/`)

Implementação do padrão **DAO** com **JDBC puro** (sem ORM).

#### `DAO.java` - Classe Base Abstrata

```java
public class DAO {
    protected Connection conexao;

    public boolean conectar() {
        // Credenciais hardcoded (ti-2.postgres.database.azure.com)
        // DriverManager.getConnection(url, username, password)
    }

    public boolean verificarConexao() {
        // Reconexão automática se connection.isClosed()
    }

    public boolean close() {
        // Fecha conexão segura
    }
}
```

**Decisão Técnica:** Credenciais hardcoded (não .env) por simplicidade do projeto acadêmico.

#### `UsuarioDAO.java` - 264 linhas

**Métodos Principais:**

| Método | SQL | Retorno |
|--------|-----|---------|
| `inserirUsuario(Usuario u)` | `INSERT ... MD5(?::text)` | `boolean` |
| `autenticarUsuario(login, senha)` | `SELECT ... WHERE senha=MD5(?)` | `Usuario \| null` |
| `buscarPorId(int id)` | `SELECT * WHERE id=?` | `Usuario` |
| `listarTodos()` | `SELECT * ORDER BY nome` | `Usuario[]` |
| `atualizarUsuario(Usuario u)` | `UPDATE ... WHERE id=?` | `boolean` |
| `excluirUsuario(int id)` | `DELETE WHERE id=?` | `boolean` |
| `loginExiste(login, idExcluir)` | Validação duplicidade | `boolean` |
| `emailExiste(email, idExcluir)` | Validação duplicidade | `boolean` |

**Segurança:**

- **MD5 nativo do PostgreSQL**: `MD5(?::text)` garante hash consistente
- **PreparedStatement**: previne SQL Injection
- **Validações de duplicata** antes de INSERT/UPDATE

#### `AtividadeDAO.java` - 150 linhas

**Queries Otimizadas:**

```sql
-- Listar atividades com ordenação por timestamp
SELECT * FROM atividade
WHERE usuario_id = ?
ORDER BY dataHora DESC

-- Busca com JOIN (se necessário)
SELECT a.*, u.nome AS usuario_nome
FROM atividade a
JOIN usuario u ON a.usuario_id = u.id
WHERE a.usuario_id = ?
```

**Performance:**

- Index em `usuario_id` (FK)
- Index em `dataHora` para ordenação
- Uso de arrays fixos (`Atividade[10000]`) → conversão para array dinâmico

#### `RecomendacaoDAO.java` - 196 linhas

**Características:**

- Ordenação por `relevancia DESC` (Alta → Baixa)
- Método `marcarComoConcluida(id)` para toggle de status
- Controle fino de abertura/fechamento de conexão por método

---

### ⚙️ Service Layer (`service/`)

Orquestra lógica complexa e integrações externas.

#### `NotificacoesService.java` - 1126 linhas 📧

**Responsabilidades:**

1. **Envio de E-mails SMTP**

   ```java
   Properties props = new Properties();
   props.put("mail.smtp.host", "smtp.gmail.com");
   props.put("mail.smtp.port", "587");
   props.put("mail.smtp.auth", "true");
   props.put("mail.smtp.starttls.enable", "true");
   ```

2. **Agendamento Automático (TimerTask)**
   - Relatórios Diários: 23:59 todo dia
   - Relatórios Semanais: Sábado 23:59
   - Lembretes: 6h, 12h, 20h
   - Heartbeat: Log a cada 1h

3. **Templates HTML Dinâmicos**

   ```java
   String html = String.format("""
       <h2>Resumo de %s</h2>
       <p>Trabalho: %.1fh / 6h</p>
       <p>Estudos: %.1fh / 4h</p>
       """, dataFormatada, horasTrabalho, horasEstudos);
   ```

**Tecnologias:**

- `javax.mail` (JavaMail API)
- `java.util.Timer` para agendamentos
- HTML inline com estilos CSS

#### `RecomendadorService.java` - 257 linhas 🤖

**Fluxo de Geração de Recomendações:**

```
1. Buscar atividades do usuário (AtividadeDAO)
   ↓
2. Construir contexto estatístico
   - Agrupar por classe
   - Calcular totais e médias
   - Identificar desbalanceamentos
   ↓
3. Montar prompt estruturado
   "Você é um assistente de produtividade.
    Analise este perfil:
    - Trabalho: 30h (média 6h/dia)
    - Estudos: 12h (abaixo da meta de 4h/dia)
    ..."
   ↓
4. Chamada HTTP à Azure OpenAI
   POST /openai/deployments/gpt-4o/chat/completions
   Headers: api-key, Content-Type
   Body: {"messages": [...], "temperature": 0.7}
   ↓
5. Parse resposta JSON
   choices[0].message.content
   ↓
6. Extrair 3 recomendações via regex
   Título: "..."
   Descrição: "..."
   Relevância: Alta/Média/Baixa → 3/2/1
   ↓
7. Salvar no banco (RecomendacaoDAO)
   ↓
8. Retornar array de Recomendacao[]
```

**Tratamento de Erros:**

- Timeout de 30s
- Fallback para recomendações genéricas se API falhar
- Logs detalhados em stderr

---

### 🌐 Controller Layer (`app/Aplicacao.java`) - 543 linhas

**Rotas REST Completas:**

```java
// CRUD Usuários
GET    /usuarios              → listarTodos()
GET    /usuarios/:id          → buscarPorId()
POST   /usuarios              → inserirUsuario()
PUT    /usuarios/:id          → atualizarUsuario()
DELETE /usuarios/:id          → excluirUsuario()
POST   /login                 → autenticarUsuario()

// CRUD Atividades
GET    /atividades?usuarioId= → listarAtividades()
GET    /atividades/:id        → buscarPorId()
POST   /atividades            → inserirAtividade()
PUT    /atividades/:id        → atualizarAtividade()
DELETE /atividades/:id        → excluirAtividade()

// Recomendações IA
GET    /recomendacoes?usuarioId= → listarRecomendacoes()
POST   /recomendacoes/gerar      → gerarRecomendacoesUsuario()
PUT    /recomendacoes/:id/status → marcarComoConcluida()
DELETE /recomendacoes/:id        → excluirRecomendacao()

// Saúde
GET    /health                → { status: "UP" }
```

**Configurações:**

- Porta: `6789`
- Static files: `/public` (Spark serve automaticamente)
- JSON: Gson para serialização
- CORS: Não necessário (same-origin)

## 🚀 Setup e Execução

### Pré-requisitos

1. **JDK 8 ou superior**

   ```bash
   # Verificar instalação
   java -version
   javac -version
   ```

2. **Apache Maven**

   ```bash
   # Verificar instalação
   mvn -version
   ```

3. **PostgreSQL**
   - Instale o PostgreSQL (v12 ou superior recomendado)
   - Crie um banco de dados para o projeto

   ```sql
   CREATE DATABASE timeawards;
   ```

4. **IDE** (opcional, mas recomendado)
   - Eclipse (projeto já configurado com `.project` e `.classpath`)
   - IntelliJ IDEA
   - VS Code com Extension Pack for Java

### Configuração do Banco de Dados

1. **Configure as credenciais** na classe `DAO.java`:

   ```java
   // Atualize com suas credenciais locais
   private static String url = "jdbc:postgresql://localhost:5432/timeawards";
   private static String usuario = "seu_usuario";
   private static String senha = "sua_senha";
   ```

2. **Execute os scripts de criação** (se disponíveis na documentação)

### Instalação e Execução

#### Via Maven (Linha de Comando)

1. **Clone e navegue até o diretório**:

   ```bash
   cd plmg-cc-ti2-2025-2-g21-timeawards/Codigo
   ```

2. **Instale as dependências**:

   ```bash
   mvn clean install
   ```

3. **Compile o projeto**:

   ```bash
   mvn compile
   ```

4. **Execute a aplicação**:

   ```bash
   mvn exec:java -Dexec.mainClass="app.Aplicacao"
   ```

#### Via Eclipse IDE

1. Importe o projeto: `File > Import > Existing Maven Projects`
2. Selecione a pasta `Codigo`
3. Aguarde o Maven baixar as dependências
4. Execute `Aplicacao.java` (botão direito > Run As > Java Application)

#### Via IntelliJ IDEA

1. Open Project e selecione a pasta `Codigo`
2. Aguarde a indexação e download de dependências
3. Localize `Aplicacao.java` e execute (Shift+F10)

### Acessando a Aplicação

Após iniciar o servidor:

- **URL**: `http://localhost:4567`
- **Dashboard**: `http://localhost:4567/dashboard.html`
- **API REST**: Endpoints definidos em `Aplicacao.java`

## 🔌 Endpoints da API (Exemplos)

```http
# Usuários
GET    /usuarios           # Lista todos os usuários
GET    /usuarios/:id       # Busca usuário por ID
POST   /usuarios           # Cria novo usuário
PUT    /usuarios/:id       # Atualiza usuário
DELETE /usuarios/:id       # Remove usuário

# Atividades
GET    /atividades         # Lista todas as atividades
GET    /atividades/:id     # Busca atividade por ID
POST   /atividades         # Cria nova atividade
PUT    /atividades/:id     # Atualiza atividade
DELETE /atividades/:id     # Remove atividade

# Recomendações
GET    /recomendacoes      # Lista recomendações
POST   /recomendacoes      # Cria recomendação
```

## 📝 Comandos Maven Úteis

```bash
# Limpar builds anteriores
mvn clean

# Compilar o projeto
mvn compile

# Executar testes (quando implementados)
mvn test

# Gerar pacote JAR executável
mvn package

# Instalar no repositório local Maven
mvn install

# Executar a aplicação
mvn exec:java -Dexec.mainClass="app.Aplicacao"

# Ver dependências
mvn dependency:tree

# Atualizar dependências
mvn clean install -U
```

## 🔧 Desenvolvimento

### Adicionando um Novo Módulo

1. **Crie o modelo** em `model/`:

   ```java
   public class NovoModelo {
       private int id;
       private String nome;
       // getters, setters, construtores
   }
   ```

2. **Crie o DAO** em `dao/`:

   ```java
   public class NovoModeloDAO extends DAO<NovoModelo> {
       // Implementar métodos CRUD
   }
   ```

3. **Crie o serviço** em `service/`:

   ```java
   public class NovoModeloService {
       // Lógica de negócio
   }
   ```

4. **Adicione rotas** em `Aplicacao.java`:

   ```java
   get("/novos", (req, res) -> {
       // Controller logic
   });
   ```

5. **Crie o módulo front-end** em `resources/public/modulos/novo_modulo/`

### Boas Práticas

- ✅ Sempre use prepared statements (evita SQL Injection)
- ✅ Mantenha a separação de responsabilidades (Model-DAO-Service)
- ✅ Valide dados de entrada
- ✅ Use try-catch para tratamento de exceções
- ✅ Feche conexões e recursos (use try-with-resources)
- ✅ Documente seu código com JavaDoc
- ✅ Commit frequentemente com mensagens descritivas

## 🐛 Troubleshooting

### Problema: "Connection refused" ao banco de dados

**Solução**:

- Verifique se o PostgreSQL está rodando: `sudo service postgresql status`
- Confirme as credenciais em `DAO.java`
- Teste a conexão: `psql -U usuario -d timeawards`

### Problema: "Port 4567 already in use"

**Solução**:

```bash
# Linux/Mac
lsof -ti:4567 | xargs kill -9

# Windows
netstat -ano | findstr :4567
taskkill /PID [PID] /F
```

### Problema: Dependências Maven não baixam

**Solução**:

```bash
mvn clean install -U
# ou delete a pasta ~/.m2/repository e execute novamente
```

### Problema: Erro "ClassNotFoundException"

**Solução**:

- Execute `mvn clean compile`
- Verifique se o driver PostgreSQL está no pom.xml
- No Eclipse: Project > Clean

## 📚 Recursos e Documentação

- [Spark Framework Documentation](http://sparkjava.com/documentation)
- [PostgreSQL JDBC Driver](https://jdbc.postgresql.org/documentation/)
- [Gson User Guide](https://github.com/google/gson/blob/master/UserGuide.md)
- [Maven Getting Started](https://maven.apache.org/guides/getting-started/)

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

## 💡 Decisões Técnicas e Justificativas

### Por que Java 25?

- ✅ **Records, Pattern Matching**: Sintaxe moderna
- ✅ **Performance JVM otimizada**
- ✅ **Compatibilidade com bibliotecas enterprise**

### Por que Spark Framework (não Spring Boot)?

- ⚡ **Leveza**: 4MB vs 20MB+ do Spring
- 🚀 **Startup rápido**: < 1s vs 5-10s
- 📚 **Simplicidade**: Ideal para APIs REST pequenas
- 🎯 **Foco didático**: Menos abstração, mais aprendizado

### Por que PostgreSQL (não MySQL)?

- 🔐 **MD5 nativo**: `MD5(?::text)` built-in
- 📊 **JSON support**: Futuro suporte a dados não-estruturados
- 🎓 **Padrão acadêmico** PUC Minas
- ☁️ **Azure managed**: ti-2.postgres.database.azure.com

### Por que JDBC puro (sem JPA/Hibernate)?

- 🎯 **Controle total** de queries
- 📈 **Performance**: Zero overhead de ORM
- 🧠 **Aprendizado**: Compreensão profunda de SQL
- 🐛 **Debug simplificado**: Queries visíveis

### Por que credenciais hardcoded?

- 📚 **Contexto acadêmico**: Prioridade em funcionalidade
- 🔒 **Banco protegido**: Azure firewall + whitelist IPs
- ⏱️ **Prazo curto**: Trade-off tempo vs segurança
- 🚫 **Não é produção**: Projeto avaliativo

**Para produção real:** Usar variáveis de ambiente, HashiCorp Vault ou Azure Key Vault.

### Por que SPA sem framework (React/Vue)?

- 📦 **Zero build step**: Editar e recarregar
- 🎨 **Vanilla JavaScript**: Fundamentals first
- 🚀 **Performance**: Sem bundle, sem overhead
- 📖 **Didático**: Foco em conceitos, não ferramentas

---

## 🚀 Performance e Otimizações

### Backend

- ✅ **Connection pooling** via `verificarConexao()`
- ✅ **PreparedStatement reuso** (JDBC statement caching)
- ✅ **Indexes PostgreSQL** em FKs e timestamps
- ✅ **Lazy loading** de recomendações (sob demanda)

### Frontend

- ✅ **LocalStorage** para sessão (reduz chamadas API)
- ✅ **Debounce** em inputs de IA (300ms delay)
- ✅ **Image resize** antes de OCR (Tesseract performance)
- ✅ **Chart.js lazy update** (evita re-render completo)

### Database

**Schema SQL Completo:**

```sql
-- Tabela usuarios
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    login VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,       -- MD5 hash
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20) UNIQUE,
    notificacoes BOOLEAN DEFAULT TRUE
);

-- Tabela atividades
CREATE TABLE atividade (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
    nome_atividade VARCHAR(255) NOT NULL,
    classe INTEGER NOT NULL CHECK (classe BETWEEN 1 AND 5),
    horas_gastas DECIMAL(10,2) NOT NULL,
    meta_horas INTEGER NOT NULL,
    meta_cumprida BOOLEAN DEFAULT FALSE,
    prioridade INTEGER NOT NULL CHECK (prioridade BETWEEN 1 AND 3),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela recomendacoes
CREATE TABLE recomendacao (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    relevancia INTEGER NOT NULL CHECK (relevancia BETWEEN 1 AND 3),
    status BOOLEAN DEFAULT FALSE
);

-- Indexes críticos
CREATE INDEX idx_atividade_usuario ON atividade(usuario_id);
CREATE INDEX idx_atividade_data ON atividade(data_hora DESC);
CREATE INDEX idx_recomendacao_usuario ON recomendacao(usuario_id);
CREATE INDEX idx_usuario_login ON usuario(login);

-- Trigger para cálculo automático de metas
CREATE OR REPLACE FUNCTION calc_meta_cumprida()
RETURNS TRIGGER AS $$
BEGIN
    NEW.meta_cumprida := NEW.horas_gastas >= NEW.meta_horas;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_meta_cumprida
BEFORE INSERT OR UPDATE ON atividade
FOR EACH ROW
EXECUTE FUNCTION calc_meta_cumprida();
```

---

## 🧪 Testes e Validação

### Testes Realizados

- ✅ **CRUD completo** de todas entidades
- ✅ **Validações de duplicidade** (login, email, telefone)
- ✅ **Autenticação MD5** com senhas corretas/incorretas
- ✅ **IA interpretação** com 50+ prompts variados
- ✅ **OCR** com 20+ imagens reais de agendas
- ✅ **Reconhecimento de voz** em português BR
- ✅ **E-mails automáticos** (relatórios diários/semanais)
- ✅ **Navegação semanal** (gráficos Chart.js)

### Cobertura de Testes

| Módulo | Cobertura Manual | Status |
|--------|------------------|--------|
| Login/Cadastro | 100% | ✅ |
| CRUD Atividades | 100% | ✅ |
| IA Prompt | 95% | ✅ |
| IA Voz | 90% | ✅ (limitado a Chrome) |
| IA OCR | 85% | ✅ (depende de qualidade) |
| Recomendações | 100% | ✅ |
| Dashboard | 100% | ✅ |
| Notificações Email | 100% | ✅ |

---

## 📚 Documentação Complementar

- 📖 [README Principal do Projeto](../README.md) - Visão geral e funcionalidades
- 🗄️ [Schema SQL Completo](database.sql) - Tabelas, triggers e views
- 🎨 [Diagramas UML/ER](../Artefatos/Diagramas/) - Arquitetura visual
- 📊 [Apresentações](../Artefatos/Slides/) - Sprints e entregas
- 📝 [Atas de Reuniões](../Artefatos/Reunioes/) - Histórico de decisões

---

## 👥 Desenvolvimento

**Grupo 21 - TimeAwards** | PUC Minas - Ciência da Computação 2025/2

> 📋 Informações completas da equipe (membros, orientadores, contatos) no [README principal](../README.md#-equipe)

---

## 📞 Contato e Suporte

**Disciplina:** Trabalho Interdisciplinar II (TI2)
**Instituição:** PUC Minas - Praça da Liberdade
**Período:** 2025/2

**Repositório:** [github.com/ICEI-PUC-Minas-CC-TI/plmg-cc-ti2-2025-2-g21-timeawards](https://github.com/ICEI-PUC-Minas-CC-TI/plmg-cc-ti2-2025-2-g21-timeawards)

---

<div align="center">

**Desenvolvido com 💙, ☕ e muita 🤖 pelo Grupo 21 - TimeAwards**

*"Clean Code, Smart AI, Better Time Management"* 🤖⏱️

**Status:** ✅ Funcional | **Versão:** 1.0.0 | **Última atualização:** 28/11/2025

</div>

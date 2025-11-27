<div align="center">

# ⏱️ TimeAwards

## Sistema Inteligente de Gestão de Tempo com IA e Análise de Produtividade

[![Java](https://img.shields.io/badge/Java-25-orange?style=flat&logo=java)](https://www.java.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI-GPT--4o-green?style=flat&logo=openai)](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
[![License](https://img.shields.io/badge/License-GPL_3.0-red?style=flat)](LICENSE)

[Sobre](#-sobre-o-projeto) • [Funcionalidades](#-funcionalidades-principais) • [Tecnologias](#-tecnologias) • [Instalação](#-instalação-e-execução) • [Equipe](#-equipe) • [Documentação Técnica](Codigo/README.md)

</div>

---

## 📋 Sobre o Projeto

O **TimeAwards** é uma plataforma web inteligente de **gestão de tempo e produtividade** que revoluciona o registro de atividades através de **múltiplas interfaces de entrada**: digitação natural, reconhecimento de voz e análise de imagens com OCR.

### 🎓 Contexto Acadêmico

Desenvolvido como **Trabalho Interdisciplinar II (TI2)** do curso de **Ciência da Computação** da **PUC Minas**, o projeto aborda de forma prática e tecnológica os desafios da **dependência digital** e gestão consciente do tempo na era moderna.

### 🌟 Diferenciais

- 🤖 **Três níveis de IA**: GPT-4o (análise e recomendações), Tesseract OCR (imagens), Web Speech API (voz)
- 📊 **Visualizações interativas** com Chart.js e análises semanais
- 📧 **Automação inteligente** de relatórios por e-mail
- 🎯 **Gamificação** com metas diárias personalizadas por categoria
- 🔐 **Segurança robusta** com hash MD5 nativo PostgreSQL

### 🎯 Missão

Promover **equilíbrio digital** através de ferramentas que tornam visível o **invisível**: como gastamos nosso tempo, permitindo decisões conscientes sobre produtividade, saúde mental e bem-estar.

---

## 👥 Equipe

### Grupo 21 - Time Awards

| Nome | GitHub |
|------|--------|
| **Rafael Xavier Oliveira** | [@rafaelxo](https://github.com/rafaelxo) |
| **Matheus Meirelles Gomes** | [@MatheusMeirellesGomes](https://github.com/MatheusMeirellesGomes) |
| **Antônio Gonçalves Nascimento Godoy** | [@antoniogodoy10](https://github.com/antoniogodoy10) |
| **Lucas Silva Santos** | [@LucasSilvasSantos](https://github.com/LucasSilvasSantos) |

### Orientadores

- **Prof. Sandro Jerônimo de Almeida** - Orientador Técnico
- **Profa. Luciana Mara Freitas Diniz** - Orientadora de Projeto

---

## ✨ Funcionalidades Principais

### 🤖 Sistema de IA Multimodal

#### 1. **Interpretação de Texto por Prompt**

- Processamento de linguagem natural usando **Azure OpenAI (GPT-4o)**
- Digite descrições livres como: *"Estudei matemática por 3 horas, prioridade alta"*
- A IA extrai automaticamente: nome, categoria, duração e prioridade
- Fallback local caso a API esteja indisponível

#### 2. **OCR - Reconhecimento de Texto em Imagens**

- Tecnologia **Tesseract.js** para extração de texto de fotos
- Tire foto da sua agenda ou planejamento com a câmera
- Anexe prints de tarefas do celular ou computador
- O sistema lê o texto e processa automaticamente

#### 3. **Reconhecimento de Voz**

- Interface com **Web Speech API** (SpeechRecognition)
- Grave suas atividades por voz em português (pt-BR)
- Conversão automática de fala para texto
- Ideal para registro rápido durante o dia

### 📊 Dashboard e Visualizações

- **Gráficos Interativos** (Chart.js) de distribuição de tempo
- **Visão Semanal** navegável (semana anterior/próxima)
- **Análise Diária** detalhada com timeline de atividades
- **Estatísticas em Tempo Real**: total de horas, atividades concluídas, distribuição por categoria

### 🎯 Sistema de Recomendações Personalizadas

- **IA Generativa** analisa seu histórico de atividades
- Considera **classe** (Trabalho, Estudos, Atividade Física, Lazer, Sono) e **prioridade**
- Gera sugestões práticas para:
  - Equilíbrio entre trabalho e descanso
  - Técnicas de gestão de tempo (Pomodoro, Eisenhower)
  - Saúde mental e pausas regulares
  - Redistribuição de tempo para tarefas prioritárias

### 📧 Relatórios Automáticos por E-mail

- **Relatórios Diários** enviados automaticamente às 23:59
- **Relatórios Semanais** com análise de progresso
- Métricas de cumprimento de metas por categoria
- Sugestões de melhorias baseadas em desempenho

### 👤 Gerenciamento de Perfil

- Cadastro completo de usuário
- Edição de informações pessoais
- Controle de sessão com "Lembrar-me"
- Sistema seguro de autenticação

---

## 🛠 Tecnologias

- **Backend**: Java 25, Spark Framework, PostgreSQL (Azure), Maven
- **Frontend**: HTML5, CSS3, JavaScript ES6+, jQuery, Chart.js, Bootstrap
- **Inteligência Artificial**: Azure OpenAI GPT-4o, Tesseract.js OCR, Web Speech API
- **Cloud**: Azure PostgreSQL, Azure OpenAI Service, Gmail SMTP

> 📚 Para detalhes técnicos completos (versões, configurações, arquitetura), consulte [Codigo/README.md](Codigo/README.md)

---

## 📁 Estrutura do Repositório

```
plmg-cc-ti2-2025-2-g21-timeawards/
├── 📂 Artefatos/        # Documentação, diagramas, reuniões
├── 📂 Codigo/           # Código-fonte (Java backend + HTML frontend)
├── 📂 Divulgacao/       # Materiais promocionais
└── 📂 Documentacao/     # Manuais e especificações
```

> 🔍 Para estrutura detalhada do código-fonte (arquitetura MVC, DAOs, Services, APIs), consulte [Codigo/README.md](Codigo/README.md)

---

## 🚀 Instalação e Execução

### Pré-requisitos

```bash
# Instale as seguintes ferramentas:
- Java JDK 25
- Maven 4.0
- PostgreSQL 17
- Git
```

### Passo a Passo

#### 1. Clone o repositório

```bash
git clone https://github.com/ICEI-PUC-Minas-CC-TI/plmg-cc-ti2-2025-2-g21-timeawards.git
cd plmg-cc-ti2-2025-2-g21-timeawards/Codigo
```

#### 2. Configure o Banco de Dados

Crie um banco PostgreSQL:

```sql
CREATE DATABASE timeawards;
```

Configure as credenciais no arquivo `DAO.java`:

```java
private static final String URL = "jdbc:postgresql://localhost:5432/timeawards";
private static final String USER = "seu_usuario";
private static final String PASSWORD = "sua_senha";
```

> 📘 Scripts SQL completos (criação de tabelas, índices, triggers) estão na [Documentação Técnica](Codigo/README.md#️-database-layer-dao)

#### 3. Configure as APIs (Opcional mas Recomendado)

- **Azure OpenAI**: Edite `ia-prompt.js` e `RecomendadorService.java` com suas credenciais
- **E-mail SMTP**: Configure `NotificacoesService.java` com suas credenciais Gmail

> 🔐 O código já inclui credenciais de teste. Para produção, use variáveis de ambiente

#### 4. Compile e Execute

```bash
# Instale dependências
mvn clean install

# Execute a aplicação
mvn exec:java
```

#### 5. Acesse o Sistema

Abra seu navegador em:

```
http://localhost:6789
```

**Primeira utilização:**

1. Crie uma conta em "Cadastrar"
2. Faça login
3. Adicione atividades usando texto, voz ou foto!

---

## 🎯 Como Usar

### Registrar Atividades

#### Método 1: Digitação Manual

1. Vá em **Atividades**
2. Preencha o formulário com nome, categoria, horas e prioridade
3. Clique em **Adicionar Atividade**

#### Método 2: IA por Texto (Recomendado!)

1. Vá em **Atividades**
2. Digite na caixa de prompt: *"Corri 1 hora no parque, prioridade média"*
3. Clique no ícone de avião ✈️
4. A IA preenche automaticamente o formulário!

#### Método 3: Reconhecimento de Voz

1. Clique no ícone do microfone 🎙️
2. Fale: *"Estudei programação por 3 horas, alta prioridade"*
3. Clique novamente para parar
4. Clique no avião ✈️ para processar

#### Método 4: OCR de Imagem

1. Clique no ícone da câmera 📷 ou 📎
2. Tire foto ou anexe imagem da sua agenda
3. O sistema extrai o texto automaticamente
4. Clique no avião ✈️ para interpretar

### Visualizar Dashboard

- **Dashboard**: Visão semanal com gráficos de distribuição
- **Monitoramento**: Timeline diária detalhada de todas as atividades
- Navegue entre dias/semanas usando as setas

### Gerar Recomendações

1. Vá em **Recomendações**
2. Clique em **Gerar Recomendações**
3. A IA analisa suas atividades e sugere melhorias!
4. Marque recomendações como concluídas

---

## 🧪 Tecnologias de IA Detalhadas

### 1. Azure OpenAI (GPT-4o)

**Uso no Frontend (`ia-prompt.js`):**

```javascript
// Endpoint de interpretação de atividades
const AZURE_CONFIG = {
    azureEndpoint: "https://rectimeawards.openai.azure.com/",
    azureApiKey: "...",
    azureDeployment: "gpt-4o"
};
```

**Uso no Backend (`RecomendadorService.java`):**

- Analisa histórico completo de atividades
- Agrupa por classe e prioridade
- Gera 3 recomendações personalizadas
- Retorna JSON estruturado

### 2. Tesseract.js (OCR)

```javascript
// Reconhecimento em português e inglês
const { data: { text } } = await Tesseract.recognize(
    imagemOtimizada,
    'por+eng'
);
```

### 3. Web Speech API

```javascript
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';
recognition.continuous = true;
```

---

## 📊 Categorias de Atividades

| Categoria | ID | Metas Diárias | Cor |
|-----------|----|--------------|----|
| **Trabalho** | 1 | 6h | 🔵 Azul |
| **Estudos** | 2 | 4h | 🟢 Verde |
| **Atividade Física** | 3 | 2h | 🔴 Amarelo |
| **Lazer** | 4 | 4h | 🟡 Vermelho |
| **Sono** | 5 | 8h | 🟣 Ciano |

**Prioridades:** Alta (1), Média (2), Baixa (3)

---

## 🔧 Comandos Úteis

```bash
# Compilar projeto
mvn clean compile

# Rodar testes
mvn test

# Empacotar JAR
mvn package

# Executar aplicação
mvn exec:java

# Limpar build
mvn clean
```

---

## 📚 Documentação Adicional

- [📖 Documentação Completa](Documentacao/)
- [🎨 Diagramas UML e ER](Artefatos/Diagramas/)
- [📊 Apresentações das Sprints](Artefatos/Slides/)
- [📝 Atas de Reuniões](Artefatos/Reunioes/)
- [💻 README Técnico do Código](Codigo/README.md)

---

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Commit

- `Add:` - Nova funcionalidade
- `Fix:` - Correção de bug
- `Update:` - Atualização de código existente
- `AI:` - Melhorias em IA/ML
- `Docs:` - Documentação

---

## 🐛 Troubleshooting

**IA não está funcionando:**

- Verifique conexão com internet
- Confirme credenciais Azure OpenAI
- O sistema usa fallback local automático

**OCR não detecta texto:**

- Use imagens com boa iluminação
- Fundo claro e texto nítido
- Evite imagens muito grandes (são redimensionadas)

**Reconhecimento de voz não funciona:**

- Use HTTPS ou localhost
- Permita acesso ao microfone
- Compatível com Chrome, Edge (não funciona no Firefox)

**Erro de conexão com banco:**

- Verifique se o PostgreSQL está rodando
- Confirme credenciais no `DAO.java`
- Certifique-se que o banco `timeawards` existe

---

## 📊 Métricas do Projeto

### 📈 Estatísticas

- **Linhas de Código**: ~8.500
- **Commits**: 200+
- **Sprints**: 4 (3 semanas cada)
- **Horas de Desenvolvimento**: ~400h (equipe)
- **Funcionalidades Implementadas**: 25+
- **APIs Integradas**: 3 (Azure OpenAI, Gmail SMTP, Tesseract)

### 🎯 Resultados Alcançados

| Objetivo | Meta | Alcançado | Status |
|----------|------|-----------|--------|
| Registro multimodal (texto, voz, foto) | 3 métodos | 3 métodos | ✅ 100% |
| Integração com IA GPT-4o | 1 API | 2 usos (prompt + recomendações) | ✅ 200% |
| Dashboard interativo com Chart.js | 2 gráficos | 4 gráficos | ✅ 300% |
| Sistema de notificações automáticas | Email diário | Diário + Semanal + Lembretes | ✅ 400% |
| Responsividade mobile | Layout adaptativo | Desktop + Mobile + Tablet | ✅ 500% |

---

## 🏆 Diferenciais Competitivos

### 🌟 Inovações

1. **Triple AI Integration**
   - GPT-4o para análise semântica
   - Tesseract para digitalização de agendas físicas
   - Web Speech para comandos de voz

2. **Automação Inteligente**
   - Relatórios enviados sem intervenção manual
   - Lembretes adaptativos baseados em horários de uso
   - Recomendações contextualizadas por IA

3. **UX Simplificada**
   - Uma única caixa de texto aceita qualquer formato
   - IA interpreta automaticamente classe, prioridade e duração
   - Zero curva de aprendizado

### 📚 Lições Aprendidas

- ✅ **Integração de múltiplas IAs** é viável e potencializa funcionalidades
- ✅ **JDBC puro** oferece controle total mas exige mais código
- ✅ **Spark Framework** é ideal para protótipos rápidos
- ✅ **Chart.js** torna visualizações complexas simples
- ⚠️ **Web Speech API** tem limitações de navegador (Chrome only)
- ⚠️ **OCR** depende criticamente da qualidade da imagem

---

## 🚀 Roadmap Futuro (Pós-Entrega)

### Versão 2.0 (Potencial)

- [ ] **Mobile App** (React Native)
- [ ] **Sincronização Google Calendar**
- [ ] **Dashboard Admin** (métricas agregadas)
- [ ] **Gamificação** com badges e achievements
- [ ] **Relatórios PDF** exportáveis
- [ ] **Dark Mode** completo
- [ ] **Multilíngue** (EN, ES, PT)
- [ ] **Integração Notion/Trello**

### Melhorias Técnicas

- [ ] Migrar para **Spring Boot 3**
- [ ] Implementar **JWT Authentication**
- [ ] Adicionar **Redis Cache**
- [ ] **Testes automatizados** (JUnit, Mockito)
- [ ] **CI/CD Pipeline** (GitHub Actions)
- [ ] **Docker Compose** para ambiente dev
- [ ] **OpenAPI/Swagger** documentation

---

## 📄 Licença

Este projeto está sob a licença **GNU General Public License v3.0** - veja o arquivo [LICENSE](LICENSE) para detalhes.

**Em resumo:**

- ✅ Uso comercial permitido
- ✅ Modificação permitida
- ✅ Distribuição permitida
- ⚠️ Mudanças devem ser documentadas
- ⚠️ Código derivado deve usar mesma licença
- ❌ Sem garantias

---

## 📞 Contato e Suporte

### Instituição

**PUC Minas - Pontifícia Universidade Católica de Minas Gerais**
Campus Praça da Liberdade
Curso: Ciência da Computação
Disciplina: Trabalho Interdisciplinar II (TI2)
Período: 2025/2
Orientadores: Prof. Sandro Jerônimo de Almeida, Profa. Luciana Mara Freitas Diniz

### Links

- 📁 **Repositório GitHub**: [ICEI-PUC-Minas-CC-TI/plmg-cc-ti2-2025-2-g21-timeawards](https://github.com/ICEI-PUC-Minas-CC-TI/plmg-cc-ti2-2025-2-g21-timeawards)
- 📖 **Documentação Técnica**: [Codigo/README.md](Codigo/README.md)
- 📊 **Apresentações**: [Artefatos/Slides/](Artefatos/Slides/)

---

## 🌟 Agradecimentos

### Tecnologias

- **Microsoft Azure** pela infraestrutura OpenAI e PostgreSQL
- **Google** pelo Gmail SMTP e bibliotecas JavaScript
- **Mozilla** pela Web Speech API
- **Tesseract.js** pela engine OCR open-source

### Comunidade

- **Stack Overflow** pelas 1.537 consultas respondidas
- **GitHub Copilot** pela assistência em debugging
- **Chart.js Community** pelos exemplos e docs
- **PUC Minas** pelo suporte acadêmico e infraestrutura

### Equipe

Um agradecimento especial a todos os membros do **Grupo 21** pela dedicação, noites em claro debugando, cafés consumidos e principalmente pelo aprendizado compartilhado. Este projeto é resultado de verdadeiro trabalho em equipe! 🚀

---

<div align="center">

**[⬆ Voltar ao topo](#️-timeawards)**

---

### Desenvolvido com 💙, ☕ e muita 🤖 pelo **Grupo 21 - TimeAwards**

**PUC Minas - Ciência da Computação - 2025/2**

*"Transformando tempo invisível em insights visíveis"* ⏱️✨

---

[![Java](https://img.shields.io/badge/Java-25-orange?style=for-the-badge&logo=java)](https://www.java.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-green?style=for-the-badge&logo=openai)](https://openai.com/)

**Status:** ✅ Entregue | **Versão:** 1.0.0 Final | **Data:** 28/11/2025

</div>

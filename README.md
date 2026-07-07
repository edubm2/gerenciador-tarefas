# Gerenciador de Tarefas - API REST 🚀

Este é o ecossistema backend de um **Gerenciador de Tarefas** desenvolvido em **Java** com o framework **Spring Boot**. A API foi estruturada seguindo o padrão arquitetural MVC (Model-View-Controller) e realiza todas as operações essenciais de um CRUD, além de permitir buscas customizadas utilizando filtros específicos.

O projeto foi projetado para atuar de forma desacoplada, servindo como uma base de dados sólida para ser consumida por qualquer interface frontend.

---

## Tecnologias Utilizadas

*   **Linguagem Principal:** Java 17
*   **Framework:** Spring Boot 4.1
*   **Persistência de Dados:** Spring Data JPA / Hibernate
*   **Banco de Dados:** MySQL
*   **Gerenciador de Dependências:** Maven
*   **Ferramenta de Testes de API:** Postman
*   **Linguagem Frontend:** HTML, CSS, JS
*   **Inteligência Artificial:** Claude AI para correção de bugs
*   **Controle de versões:** Github para versionamento e controle de código

---
## Arquitetura de solução
### Camadas do back-end

O back-end segue uma arquitetura em camadas, onde cada uma tem uma única responsabilidade.
A requisição HTTP percorre o seguinte caminho:

```
Front-end (HTML/CSS/JS) → fetch() → Controller → Service → Repository → MySQL
```
**Controller** (`controller/GerenciadorController.java`)
Camada responsável por expor a API HTTP. Recebe as requisições em `/tarefas`, extrai os dados (corpo da requisição, parâmetros de rota) e delega toda a lógica para o `GerenciadorService` — o controller não acessa o banco nem toma decisões de negócio, só traduz HTTP em chamadas Java e devolve a resposta.

**Service** (`service/GerenciadorService.java`)
Concentra as regras de negócio e orquestra as chamadas ao repositório:
- `criar` — salva uma nova tarefa e retorna a lista atualizada;
- `listar` — retorna todas as tarefas ordenadas por nome;
- `alterar` — atualiza uma tarefa existente (o objeto completo é salvo, substituindo a linha inteira no banco);
- `deletar` — remove uma tarefa pelo `id`;
- `buscarComFiltros` — combina busca por nome e/ou categoria (`filtro`), com fallback para a listagem padrão quando nenhum filtro é informado;
- `buscarPorStatus` — retorna as tarefas filtradas por `realizado` (pendente/concluída).

**Repository** (`repository/GerenciadorRepository.java`)
Camada de acesso a dados, usando Spring Data JPA. Estende `JpaRepository<Gerenciador, Long>`, o que já fornece os métodos básicos de CRUD (`save`, `findAll`, `findById`, `deleteById`). E também, define métodos de consulta derivada — o Spring Data JPA gera a query SQL automaticamente a partir do nome do método, sem precisar escrever SQL manualmente:
- `findByRealizado(boolean)`
- `findByNomeContainingIgnoreCase(String, Sort)`
- `findByFiltro(String)`
- `findByNomeContainingIgnoreCaseAndFiltro(String, String, Sort)`

**Entity** (`service/Gerenciador.java`)
Representa a tabela `tarefas` no MySQL, mapeada via JPA (`@Entity`, `@Table`, `@Id`). Cada instância corresponde a uma linha da tabela, com os campos `id`, `nome`, `descricao`, `filtro` e `realizado`.

---
### Comunicação entre front-end e back-end

O front-end é estático (HTML/CSS/JS puro) e não acessa o banco de dados em nenhum momento — toda leitura e escrita passam pela API REST do back-end via `fetch()`, trocando dados em JSON. Essa separação permite, por exemplo, trocar o front-end por outra tecnologia (React, mobile, etc.) sem alterar uma linha do back-end.

### Endpoints da API

| Método | Rota                          | Descrição                                              |
|--------|-------------------------------|----------------------------------------------------------|
| GET    | `/tarefas`                    | Lista todas as tarefas                                    |
| GET    | `/tarefas/status/{realizado}` | Lista tarefas filtradas por status (`true`/`false`)       |
| POST   | `/tarefas`                    | Cria uma nova tarefa                                       |
| PUT    | `/tarefas`                    | Atualiza uma tarefa (objeto completo no corpo, incluindo `id`) |
| DELETE | `/tarefas/{id}`               | Remove uma tarefa                                          |

### Estrutura de pastas

```
gerenciador-tarefas/
├── src/
│   ├── main/
│   │   ├── java/br/com/eduleme/gerenciador_tarefas/
│   │   │   ├── GerenciadorTarefasApplication.java
│   │   │   ├── config/CorsConfig.java
│   │   │   ├── controller/GerenciadorController.java
│   │   │   ├── repository/GerenciadorRepository.java
│   │   │   └── service/
│   │   │       ├── Gerenciador.java        # entidade JPA
│   │   │       └── GerenciadorService.java
│   │   ├── frontend/                        # HTML/CSS/JS estático
│   │   │   ├── index.html
│   │   │   ├── style.css
│   │   │   └── app.js
│   │   └── resources/application.properties
│   └── test/
└── pom.xml
```


## Principais decisões tomadas durante o desenvolvimento

- **PUT com o objeto completo, em vez de atualização parcial por `{id}`**: o endpoint `PUT /tarefas` espera a tarefa inteira no corpo da requisição, porque `GerenciadorService.alterar()` usa `repository.save()`, que substitui a linha inteira no banco. Por isso o front-end sempre reenvia o objeto completo (título, descrição, categoria e status) mesmo quando só o status muda — um payload parcial apagaria os outros campos.

- **MySQL como banco de dados**: optei por um banco relacional real em vez de armazenamento em memória ou arquivo JSON, para a aplicação se comportar como um projeto de produção, com persistência real entre execuções.

- **CORS restrito a `localhost:5500`/`127.0.0.1:5500`**, em vez de liberar todas as origens (`*`): mantém a API mais segura por padrão, já que essas são as portas usadas pela extensão Live Server do VS Code durante o desenvolvimento local. Isso exige que quem rodar o projeto sirva o front-end nessa porta específica (ver seção "Rodar o frontend").

- **Campo de `filtro` reaproveitado como prioridade**: no modelo original o campo `filtro` foi pensado como categoria livre, mas no front-end ele acabou virando um seletor de prioridade (Baixa/Média/Alta) — uma funcionalidade extra sem precisar alterar a entidade ou o banco.

---
##  Configuração e Execução Local

### Pré-requisitos
Antes de iniciar o projeto, certifique-se de ter instalado:
*   Java JDK 17 ou superior
*   MySQL Server ativo
*   Uma IDE como VS Code ou IntelliJ IDEA
  

### Clonar o Repositório
```bash
git clone https://github.com/edubm2/gerenciador-tarefas.git
cd gerenciador-tarefas
```

  ###  Preparar o banco de dados
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gerenciador_tarefas
spring.datasource.username=edu
spring.datasource.password=123456
```

Na sua maquina, entre no MySQL e crie isso:
OBS: Para utilizar outro usuário/senha na sua maquina, basta editar essas mesmas linhas em src/main/resources/application.properties após o clone.

```sql
CREATE DATABASE gerenciador_tarefas;
CREATE USER 'edu'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON gerenciador_tarefas.* TO 'edu'@'localhost';
FLUSH PRIVILEGES;
```
---

### Rodar o backend
```bash
# Windows
mvnw spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```
A API deve subir em http://localhost:8081

### Rodar o frontend
O arquivo está em src/main/frontend/index.html. 
IMPORTANTE:
Como o CORS está travado na porta 5500, você precisa servir por ali, não abra o arquivo direto com duplo clique (file://), porque o navegador vai bloquear a chamada pra API.
OPÇÃO UTILIZADA PARA RODAR O CÓDIGO
* Abra a pasta src/main/frontend no VS Code
* Clique com o botão direito em index.html → "Open with Live Server"
* Confirme que abriu em http://127.0.0.1:5500 ou http://localhost:5500




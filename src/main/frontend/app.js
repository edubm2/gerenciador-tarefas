
const CONFIG = {
 
  API_BASE_URL: "http://localhost:8081/tarefas",

  FIELDS: {
    id: "id",
    title: "nome",
    description: "descricao",
    status: "realizado",
    priority: "filtro",
  },
};


function priorityClass(value) {
  const normalized = (value || "").toLowerCase();
  if (normalized === "alta") return "is-alta";
  if (normalized === "baixa") return "is-baixa";
  return "is-media";
}

let tasks = [];
let currentFilter = "all";
let currentPriorityFilter = "all";


const els = {
  form: document.getElementById("taskForm"),
  titleInput: document.getElementById("title"),
  descriptionInput: document.getElementById("description"),
  priorityInput: document.getElementById("priority"),
  formError: document.getElementById("formError"),
  submitBtn: document.getElementById("submitBtn"),
  taskList: document.getElementById("taskList"),
  emptyState: document.getElementById("emptyState"),
  listMessage: document.getElementById("listMessage"),
  template: document.getElementById("taskTemplate"),
  filterBtns: document.querySelectorAll(".filter-btn"),
  priorityFilterSelect: document.getElementById("priorityFilter"),
  statTotal: document.getElementById("statTotal"),
  statPending: document.getElementById("statPending"),
  statDone: document.getElementById("statDone"),
  apiUrlLabel: document.getElementById("apiUrlLabel"),
};

els.apiUrlLabel.textContent = CONFIG.API_BASE_URL;

// HELPERS DE STATUS "realizado" é boolean: true = concluída, false = pendente
function isTaskDone(task) {
  return task[CONFIG.FIELDS.status] === true;
}

function buildStatusPayload(task, done) {
  return {
    ...task,
    [CONFIG.FIELDS.status]: done,
  };
}

//CHAMADAS À API

async function apiRequest(path, options = {}) {
  const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.message || JSON.stringify(body);
    } catch (_) {
  
    }
    throw new Error(`Erro ${response.status} ao chamar a API. ${detail}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function fetchTasks() {
  return apiRequest("", { method: "GET" });
}

async function createTask(payload) {
  return apiRequest("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateTask(payload) {
  // O @PutMapping do GerenciadorController não recebe {id} na URL —
  // o id precisa vir dentro do corpo, porque o service só faz
  // repository.save(gerenciador).
  return apiRequest("", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function deleteTask(id) {
  return apiRequest(`/${id}`, { method: "DELETE" });
}

//RENDERIZAÇÃO
function renderTasks() {
  const filtered = tasks.filter((task) => {
    const statusMatch =
      currentFilter === "pending" ? !isTaskDone(task) :
      currentFilter === "done" ? isTaskDone(task) :
      true;

    const priorityMatch =
      currentPriorityFilter === "all" ||
      task[CONFIG.FIELDS.priority] === currentPriorityFilter;

    return statusMatch && priorityMatch;
  });

  els.taskList.innerHTML = "";

  if (filtered.length === 0) {
    els.emptyState.hidden = false;
    els.emptyState.querySelector(".empty-copy").textContent =
      currentFilter === "all" && currentPriorityFilter === "all"
        ? "Adicione a primeira tarefa usando o formulário ao lado."
        : "Nenhuma tarefa corresponde a este filtro.";
  } else {
    els.emptyState.hidden = true;
  }

  filtered.forEach((task) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    const id = task[CONFIG.FIELDS.id];
    const done = isTaskDone(task);
    const priority = task[CONFIG.FIELDS.priority] || "Média";

    node.dataset.id = id;
    node.classList.toggle("is-done", done);

    node.querySelector(".task-title").textContent = task[CONFIG.FIELDS.title] || "(sem título)";
    node.querySelector(".task-description").textContent = task[CONFIG.FIELDS.description] || "";

    const statusBadge = node.querySelector(".badge-status");
    statusBadge.textContent = done ? "Concluída" : "Pendente";

    const priorityBadge = node.querySelector(".badge-priority");
    priorityBadge.textContent = priority;
    priorityBadge.classList.add(priorityClass(priority));

    const toggleLabel = node.querySelector('[data-action="toggle"] .btn-label');
    toggleLabel.textContent = done ? "Marcar como pendente" : "Marcar como concluída";

    node.querySelector('[data-action="toggle"]').addEventListener("click", () => handleToggle(id));
    node.querySelector('[data-action="delete"]').addEventListener("click", () => handleDelete(id, node));

    els.taskList.appendChild(node);
  });

  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(isTaskDone).length;
  els.statTotal.textContent = total;
  els.statDone.textContent = done;
  els.statPending.textContent = total - done;
}

function showMessage(text, isError = false) {
  els.listMessage.textContent = text;
  els.listMessage.hidden = !text;
  els.listMessage.classList.toggle("is-error", isError);
}

async function loadTasks() {
  showMessage("Carregando tarefas...");
  try {
    const data = await fetchTasks();
    tasks = Array.isArray(data) ? data : data.content || [];
    showMessage("");
    renderTasks();
  } catch (err) {
    console.error(err);
    showMessage(
      `Não foi possível carregar as tarefas.`,
      true
    );
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  els.formError.textContent = "";

  const title = els.titleInput.value.trim();
  const description = els.descriptionInput.value.trim();

  if (!title) {
    els.formError.textContent = "O título é obrigatório.";
    els.titleInput.focus();
    return;
  }

  const payload = {
    [CONFIG.FIELDS.title]: title,
    [CONFIG.FIELDS.description]: description,
    [CONFIG.FIELDS.status]: false, // toda tarefa nova começa como pendente
    [CONFIG.FIELDS.priority]: els.priorityInput.value,
  };

  els.submitBtn.disabled = true;
  els.submitBtn.querySelector(".btn-label").textContent = "Adicionando...";

  try {
    // O @PostMapping do GerenciadorController devolve a LISTA inteira
    // já atualizada (não só a tarefa criada)
    tasks = await createTask(payload);
    renderTasks();
    els.form.reset();
    els.titleInput.focus();
  } catch (err) {
    console.error(err);
    els.formError.textContent = "Não foi possível criar a tarefa. Tente novamente.";
  } finally {
    els.submitBtn.disabled = false;
    els.submitBtn.querySelector(".btn-label").textContent = "Adicionar tarefa";
  }
}

async function handleToggle(id) {
  const task = tasks.find((t) => t[CONFIG.FIELDS.id] === id);
  if (!task) return;

  const nextDone = !isTaskDone(task);
  // Manda o objeto inteiro (spread de "task") e o novo valor de
  // "realizado", já que o save() do JPA substitui a linha inteira —
  // se mandasse só o {id, realizado}, os outros campos (nome,
  // descricao, filtro...) seriam zerados no banco.
  const payload = buildStatusPayload(task, nextDone);

  const previousTasks = tasks;

  tasks = tasks.map((t) => (t[CONFIG.FIELDS.id] === id ? payload : t));
  renderTasks();

  try {
    tasks = await updateTask(payload);
    renderTasks();
  } catch (err) {
    console.error(err);
    tasks = previousTasks;
    renderTasks();
    showMessage("Não foi possível atualizar o status da tarefa.", true);
  }
}

async function handleDelete(id, node) {
  node.classList.add("is-removing");

  try {

    const updatedList = await deleteTask(id);
    setTimeout(() => {
      tasks = updatedList;
      renderTasks();
    }, 150);
  } catch (err) {
    console.error(err);
    node.classList.remove("is-removing");
    showMessage("Não foi possível excluir a tarefa.", true);
  }
}

function handleFilterClick(event) {
  const btn = event.currentTarget;
  currentFilter = btn.dataset.filter;

  els.filterBtns.forEach((b) => {
    b.classList.toggle("is-active", b === btn);
    b.setAttribute("aria-selected", b === btn ? "true" : "false");
  });

  renderTasks();
}

function handlePriorityFilterChange(event) {
  currentPriorityFilter = event.target.value;
  renderTasks();
}

//INICIALIZAÇÃO

els.form.addEventListener("submit", handleSubmit);
els.filterBtns.forEach((btn) => btn.addEventListener("click", handleFilterClick));
els.priorityFilterSelect.addEventListener("change", handlePriorityFilterChange);

loadTasks();

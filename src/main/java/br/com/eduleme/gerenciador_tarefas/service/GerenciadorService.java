package br.com.eduleme.gerenciador_tarefas.service;
import br.com.eduleme.gerenciador_tarefas.repository.GerenciadorRepository;
import java.util.List;


import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class GerenciadorService {

    private GerenciadorRepository gerenciadorRepository;
    public GerenciadorService(GerenciadorRepository GerenciadorRepository){
        this.gerenciadorRepository = GerenciadorRepository;
    }
    
    public List<Gerenciador> criar(Gerenciador gerenciador) {
        gerenciadorRepository.save(gerenciador);
        return listar();

    }

    // mostra todas as tarefas
    public List<Gerenciador> listar() {
        Sort sort = Sort.by("nome");
        
        return gerenciadorRepository.findAll(sort);
        
    }

    // modificar 
    public List<Gerenciador> alterar(Gerenciador gerenciador) {
        gerenciadorRepository.save(gerenciador);
        return listar();

        
    }
    // deletar
    public List<Gerenciador> deletar(Long id) {
        gerenciadorRepository.deleteById(id);;
        return listar();
        
    }

    public List<Gerenciador> buscarComFiltros(String nome, String prioridade) {
        Sort sort = Sort.by("prioridade").descending().and(
            Sort.by("nome").ascending()
        );

        // Se ambos os filtros foram enviados
        if (nome != null && prioridade != null) {
            return gerenciadorRepository.findByNomeContainingIgnoreCaseAndPrioridade(nome, prioridade, sort);
        }
        
        // Se apenas o nome foi enviado
        if (nome != null) {
            return gerenciadorRepository.findByNomeContainingIgnoreCase(nome, sort);
        }
        
        // Se apenas a prioridade foi enviada
        if (prioridade != null) {
            return gerenciadorRepository.findByPrioridade(prioridade, sort);
        }

        // Se nenhum filtro foi enviado, traz a listagem padrão ordenada
        return listar();
    }
    public List<Gerenciador> buscarPorStatus(boolean realizado) {
        return gerenciadorRepository.findByRealizado(realizado);
    }   
}



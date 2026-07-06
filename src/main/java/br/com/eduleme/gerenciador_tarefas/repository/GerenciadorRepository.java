package br.com.eduleme.gerenciador_tarefas.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.eduleme.gerenciador_tarefas.service.Gerenciador;

public interface GerenciadorRepository extends JpaRepository<Gerenciador, Long>{
    //Boolean se foi realizado ou não (True ou False)
    List<Gerenciador> findByRealizado(boolean realizado);
    
    List<Gerenciador> findByNomeContainingIgnoreCase(String nome, Sort sort);
    
    // Filtra tarefas por uma prioridade específica
    List<Gerenciador> findByPrioridade(String prioridade, Sort sort);
    
    // Filtra combinando nome E prioridade ao mesmo tempo
    List<Gerenciador> findByNomeContainingIgnoreCaseAndPrioridade(String nome, String prioridade, Sort sort);

}

    

    
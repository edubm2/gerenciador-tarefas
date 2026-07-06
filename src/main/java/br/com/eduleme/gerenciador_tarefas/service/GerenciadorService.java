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

    public List<Gerenciador> buscarComFiltros(String nome, String filtro) { 
    // Ordena por filtro
    Sort sort = Sort.by("filtro").descending().and(
        Sort.by("nome").ascending()
    );

    // Se ambos os filtros foram enviados
    if (nome != null && filtro != null) {
        // Corrigido o nome do método para usar AndFiltro
        return gerenciadorRepository.findByNomeContainingIgnoreCaseAndFiltro(nome, filtro, sort);
    }

    // Se apenas o nome foi enviado
    if (nome != null) {
        return gerenciadorRepository.findByNomeContainingIgnoreCase(nome, sort);
    }

    // Se apenas o filtro foi enviado
    if (filtro != null) {
        // 🌟 Agora o Java reconhece a variável 'filtro' perfeitamente!
        return gerenciadorRepository.findByFiltro(filtro);
    }

    // Se nenhum filtro foi enviado, traz a listagem padrão ordenada
    return listar();
    }
}



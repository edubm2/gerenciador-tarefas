package br.com.eduleme.gerenciador_tarefas.controller;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.eduleme.gerenciador_tarefas.service.Gerenciador;
import br.com.eduleme.gerenciador_tarefas.service.GerenciadorService;

@RestController
@RequestMapping("/tarefas")
public class GerenciadorController {
    private GerenciadorService gerenciadorService;
    
    public GerenciadorController(GerenciadorService gerenciadorService) {
        this.gerenciadorService = gerenciadorService;
    }

    
    @PostMapping
    List<Gerenciador> criar(@RequestBody Gerenciador gerenciador) {
        return gerenciadorService.criar(gerenciador);
        
    }

    @GetMapping
    List<Gerenciador> listar(){
        return gerenciadorService.listar();

    }
    
    @PutMapping
    List<Gerenciador> alterar(@RequestBody Gerenciador gerenciador){
        return gerenciadorService.alterar(gerenciador);

    }
    
    //Chama o verbo delete com o parametro ID para deletar as tarefas
    @DeleteMapping({"id"})
    List<Gerenciador> deletar(Long id){
        return gerenciadorService.deletar(id);

    }
    @GetMapping("/status/{realizado}")
    List<Gerenciador> listarPorStatus(@PathVariable boolean realizado) {
        return gerenciadorService.buscarPorStatus(realizado);

    }
}

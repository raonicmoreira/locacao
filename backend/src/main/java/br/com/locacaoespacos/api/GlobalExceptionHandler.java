package br.com.locacaoespacos.api;

import br.com.locacaoespacos.exception.AcessoNegadoException;
import br.com.locacaoespacos.exception.ConflitoDependenciaException;
import br.com.locacaoespacos.exception.IntegracaoException;
import br.com.locacaoespacos.exception.NegocioException;
import br.com.locacaoespacos.exception.RecursoNaoEncontradoException;
import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ErroResponse> handleNegocio(NegocioException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ErroResponse.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                        .erro(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> handleRecursoNaoEncontrado(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResponse.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .status(HttpStatus.NOT_FOUND.value())
                        .erro(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(ConflitoDependenciaException.class)
    public ResponseEntity<ErroResponse> handleConflitoDependencia(ConflitoDependenciaException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErroResponse.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .status(HttpStatus.CONFLICT.value())
                        .erro(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ErroResponse> handleAcessoNegado(AcessoNegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErroResponse.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .status(HttpStatus.FORBIDDEN.value())
                        .erro(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(IntegracaoException.class)
    public ResponseEntity<ErroResponse> handleIntegracao(IntegracaoException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ErroResponse.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                        .erro(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> handleValidacao(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErroResponse.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .status(HttpStatus.BAD_REQUEST.value())
                        .erro(mensagem)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> handleGenerico(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErroResponse.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .erro("Erro interno do servidor.")
                        .build());
    }

    @Builder
    @Getter
    public static class ErroResponse {
        private String timestamp;
        private int status;
        private String erro;
    }
}

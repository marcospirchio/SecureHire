package com.securehire.backend.model;

import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "usuarios")
public class Usuario implements UserDetails {
    @Id
    private String id;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;
    private String empresa;
    private Date fechaCreacion;
    private String passwordHash;
    private String dni;
    private List<String> puestosPublicados;
    private List<Notificacion> notificaciones;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Notificacion {
        private String id;
        private String tipo;
        private String mensaje;
        private Date fecha;
        private boolean leido;
        private String candidatoId;
        private String entrevistaId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(rol));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
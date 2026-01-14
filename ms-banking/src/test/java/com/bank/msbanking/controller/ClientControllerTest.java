package com.bank.msbanking.controller;

import com.bank.msbanking.entity.Client;
import com.bank.msbanking.services.ClientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
public class ClientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClientService clientService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAllClients_ShouldReturnList() throws Exception {
        Client client = new Client();
        client.setName("Juan Perez");
        List<Client> clients = new ArrayList<>();
        clients.add(client);
        Page<Client> clientPage = new PageImpl<>(clients, PageRequest.of(0, 10), 1);

        given(clientService.getAllClients(ArgumentMatchers.any(), ArgumentMatchers.any(Pageable.class)))
                .willReturn(clientPage);

        mockMvc.perform(get("/clientes")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Juan Perez"));
    }

    @Test
    void createClient_ShouldReturnCreated() throws Exception {
        Client client = new Client();
        client.setName("Juan Perez");
        client.setAge(25);
        client.setPassword("1234");
        client.setStatus(true);

        given(clientService.createClient(any(Client.class))).willReturn(client);

        mockMvc.perform(post("/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(client)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Juan Perez"));
    }

    @Test
    void updateClient_ShouldReturnUpdated() throws Exception {
        Client client = new Client();
        client.setName("Juan Updated");

        given(clientService.updateClient(anyLong(), any(Client.class))).willReturn(client);

        mockMvc.perform(put("/clientes/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(client)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Juan Updated"));
    }

    @Test
    void deleteClient_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/clientes/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}

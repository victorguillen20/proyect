package com.bank.msbanking.services;

import com.bank.msbanking.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ClientService {
    Client createClient(Client client);
    Client updateClient(Long id, Client client);
    void deleteClient(Long id);
    Client getClientById(Long id);
    Page<Client> getAllClients(String search, Pageable pageable);
}

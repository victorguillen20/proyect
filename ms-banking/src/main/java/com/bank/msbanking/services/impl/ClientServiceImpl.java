package com.bank.msbanking.services.impl;

import com.bank.msbanking.entity.Client;
import com.bank.msbanking.services.ClientService;
import com.bank.msbanking.repository.ClientRepository;
import com.bank.msbanking.util.ValidationUtil;
import com.bank.msbanking.util.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {
    private final ClientRepository clientRepository;

    @Override
    public Client createClient(Client client) {
        if (clientRepository.existsByIdentification(client.getIdentification())) {
            throw new IllegalArgumentException("Ya existe un cliente con la identificación " + client.getIdentification());
        }
        ValidationUtil.validateAge(client.getAge());
        return clientRepository.save(client);
    }

    @Override
    public Client updateClient(Long id, Client client) {
        return clientRepository.findById(id).map(existing -> {
            existing.setName(client.getName());
            existing.setGender(client.getGender());
            existing.setAge(client.getAge());
            existing.setIdentification(client.getIdentification());
            existing.setAddress(client.getAddress());
            existing.setPhone(client.getPhone());
            existing.setPassword(client.getPassword());
            existing.setStatus(client.getStatus());
            return clientRepository.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Client not found"));
    }

    @Override
    public void deleteClient(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client not found");
        }
        clientRepository.deleteById(id);
    }

    @Override
    public Client getClientById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
    }

    @Override
    public Page<Client> getAllClients(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return clientRepository.findAll(pageable);
        }
        return clientRepository.searchClients(search, pageable);
    }
}

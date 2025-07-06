package com.coding.coding.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import okhttp3.internal.platform.OpenJSSEPlatform;
@Data
@Document(collection = "AllowedDomains")
public class AllowedDomain {
    @Id
    private String id;

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    private String domain;

    // constructors, getters, setters
}

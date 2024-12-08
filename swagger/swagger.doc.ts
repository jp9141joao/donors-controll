export const swaggerDonorModulesSchemas = {
    createFamilyRequestBody: {
        type: "object",
        properties: {
            currentFamilyId: { type: "number" },
            newFamilyData: {
                type: "object",
                properties: {
                    family_name: { type: "string" },
                    family_responsible_name: { type: "string" },
                    number_members: { type: "number" },
                    withdraw_donations: { type: "boolean" },
                    cep: { type: "string" },
                    city: { type: "string" },
                    street: { type: "string" },
                    house_number: { type: "string" },
                    neighborhood: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                },
                required: ["family_name", "family_responsible_name", "withdraw_donations", "email", "phone"],
            },
        },
        required: ["currentFamilyId", "newFamilyData"],
    },

    updateFamilyRequestBody: {
        type: "object",
        properties: {
            newFamilyData: {
                type: "object",
                properties: {
                    family_name: { type: "string" },
                    family_responsible_name: { type: "string" },
                    number_members: { type: "number" },
                    withdraw_donations: { type: "boolean" },
                    cep: { type: "string" },
                    city: { type: "string" },
                    street: { type: "string" },
                    house_number: { type: "string" },
                    neighborhood: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                },
            },
        },
    },

    createDonorRequestBody: {
        type: "object",
        properties: {
            currentDonorId: { type: "number" },
            currentDonorEnterpriseId: { type: "number" },
            newDonorData: {
                type: "object",
                properties: {
                    id_enterprise: { type: "integer", format: "int64" },
                    email: { type: "string" },
                    password: { type: "string" },
                    donation_period: { type: "string" },
                    donor_type: { type: "string" },
                    name: { type: "string" },
                    phone: { type: "string" },
                    social_network: { type: "string" },
                    birth_date: { type: "string", format: "date" },
                },
                required: ["email", "password", "donation_period", "donor_type", "name", "phone"],
            },
            newDonorEnterpriseData: {
                type: "object",
                properties: {
                    responsible_name: { type: "string" },
                    enterprise_name: { type: "string" },
                    cnpj: { type: "string" },
                    cep: { type: "string" },
                    city: { type: "string" },
                    street: { type: "string" },
                    enterprise_number: { type: "string" },
                    neighborhood: { type: "string" },
                },
                required: ["responsible_name", "enterprise_name", "cnpj", "cep", "city", "street", "enterprise_number", "neighborhood"],
            },
        },
        required: ["currentDonorId", "newDonorData"],
    },

    updateDonorRequestBody: {
        type: "object",
        properties: {
            newDonorData: {
                type: "object",
                properties: {
                    id_enterprise: { type: "integer", format: "int64" },
                    email: { type: "string" },
                    password: { type: "string" },
                    donation_period: { type: "string" },
                    donor_type: { type: "string" },
                    name: { type: "string" },
                    phone: { type: "string" },
                    social_network: { type: "string" },
                    birth_date: { type: "string", format: "date" },
                },
            },
            newDonorEnterpriseData: {
                type: "object",
                properties: {
                    responsible_name: { type: "string" },
                    enterprise_name: { type: "string" },
                    cnpj: { type: "string" },
                    cep: { type: "string" },
                    city: { type: "string" },
                    street: { type: "string" },
                    enterprise_number: { type: "string" },
                    neighborhood: { type: "string" },
                },
            },
        },
    },

    createDonationsRequestBody: {
        type: "object",
        properties: {
            currentDonationId: { type: "number" },
            newDonationData: {
                type: "object",
                properties: {
                    id_donor: { type: "integer", format: "int64" },
                    donation_type: { type: "string" },
                    donation_date: { type: "string", format: "date" },
                    scheduled_date: { type: "string", format: "date" },
                    donation_value: { type: "number" },
                    donation_received: { type: "boolean" },
                },
                required: ["id_donor", "donation_type", "donation_received"],
            },
        },
        required: ["currentDonationId", "newDonationData"],
    },

    updateDonationsRequestBody: {
        type: "object",
        properties: {
            newDonationData: {
                type: "object",
                properties: {
                    id_donor: { type: "integer", format: "int64" },
                    donation_type: { type: "string" },
                    donation_date: { type: "string", format: "date" },
                    scheduled_date: { type: "string", format: "date" },
                    donation_value: { type: "number" },
                    donation_received: { type: "boolean" },
                },
            },
        },
    },

    createPixDonationRequestBody: {
        type: "object",
        properties: {
            currentPixDonationId: { type: "number" },
            newPixDonationData: {
                type: "object",
                properties: {
                    pix_key: { type: "string" },
                    name: { type: "string" },
                    city: { type: "string" },
                    cep: { type: "string" },
                },
                required: ["pix_key", "name", "city", "cep"],
            },
        },
        required: ["currentPixDonationId", "newPixDonationData"],
    },

    updatePixDonationRequestBody: {
        type: "object",
        properties: {
            newPixDonationData: {
                type: "object",
                properties: {
                    pix_key: { type: "string" },
                    name: { type: "string" },
                    city: { type: "string" },
                    cep: { type: "string" },
                },
            },
        },
    },

    createItemsDonationRequestBody: {
        type: "object",
        properties: {
            newItemDonationData: {
                type: "object",
                properties: {
                    id_donation: { type: "integer", format: "int64" },
                    id_item: { type: "integer", format: "int64" },
                    id_product: { type: "integer", format: "int64" },
                    amount: { type: "number" },
                },
                required: ["id_donation", "id_item", "id_product", "amount"],
            },
        },
    },

    updateItemsDonationRequestBody: {
        type: "object",
        properties: {
            newItemDonationData: {
                type: "object",
                properties: {
                    id_donation: { type: "integer", format: "int64" },
                    id_item: { type: "integer", format: "int64" },
                    id_product: { type: "integer", format: "int64" },
                    amount: { type: "number" },
                },
            },
        },
    },
};

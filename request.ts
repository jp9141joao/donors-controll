export interface createFamilyRequestBody {
    currentFamilyId: number;
    newFamilyData: {
        family_name: string,
        family_responsible_name: string,
        number_members?: number,
        withdraw_donations: boolean,
        cep?: string,
        city?: string,
        street?: string,
        house_number?: string,
        neighborhood?: string,
        email: string,
        phone: string 
    };
}

export interface updateFamilyRequestBody {
    newFamilyData: {
        family_name?: string,
        family_responsible_name?: string,
        number_members?: number,
        withdraw_donations?: boolean,
        cep?: string,
        city?: string,
        street?: string,
        house_number?: string,
        neighborhood?: string,
        email?: string,
        phone?: string 
    };
}

export interface createDonorRequestBody {
    currentDonorId: number;
    currentDonorEnterpriseId?: number;
    newDonorData: {
        id_enterprise?: number,
        email: string,
        password: string,
        donation_period: string,
        donor_type: string,
        name: string,
        phone: string,
        social_network?: string,
        birth_date?: Date
    };
    newDonorEnterpriseData?: {
        responsible_name: string,
        enterprise_name: string
        cnpj: string,
        cep: string,
        city: string,
        street: string,
        enterprise_number: string,
        neighborhood: string
    };
}

export interface updateDonorRequestBody {
    newDonorData: {
        id_enterprise?: bigint,
        email?: string,
        password?: string,
        donation_period?: string,
        donor_type?: string,
        name?: string,
        phone?: string,
        social_network?: string,
        birth_date?: Date
    };
    newDonorEnterpriseData?: {
        responsible_name?: string,
        enterprise_name?: string,
        cnpj?: string,
        cep?: string,
        city?: string,
        street?: string,
        enterprise_number?: string,
        neighborhood?: string
    };

}

export interface createDonationsRequestBody {
    currentDonationId: number;
    newDonationData: {
        id_donor: bigint,
        donation_type: string,
        donation_date?: Date,
        scheduled_date?: Date,
        donation_value?: number,
        donation_received: boolean
    };
}

export interface updateDonationsRequestBody {
    newDonationData: {
        id_donor?: bigint,
        donation_type?: string,
        donation_date?: Date,
        scheduled_date?: Date,
        donation_value?: number,
        donation_received?: boolean
    };
}

export interface createPixDonationRequestBody {
    currentPixDonationId: number;
    newPixDonationData: {
        pix_key: string,
        name: string,
        city: string,
        cep: string
    }
}

export interface updatePixDonationRequestBody {
    newPixDonationData: {
        pix_key?: string,
        name?: string,
        city?: string,
        cep?: string
    }
}

export interface createItemsDonationsRequestBody {
    newItemDonationData: {
        id_donation: bigint,
        id_product: bigint,
        amount: number
    };
}

export interface updateItemsDonationsRequestBody {
    newItemDonationData: {
        id_donation?: bigint,
        id_product?: bigint,
        amount?: number
    };
}


/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import '../Login/login.scss';
import './bartenderAuth.scss';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLazyQuery } from "@apollo/client";
import { GetBartender } from '../../graphql/queries/bartenderQueries';
import Loading from "../../components/Loading";

interface BartenderFormData {
    securityCode: string;
};

const bartenderFormSchema = z.object({
    securityCode: z.string().nonempty('O código é obrigatório'),
});

function BartenderAuth() {
    const [loading, setLoading] = useState(true);
    const [getBartender, { data: bartenderData }] = useLazyQuery(GetBartender);
    const { register, handleSubmit, formState: { errors } } = useForm<BartenderFormData>({
        resolver: zodResolver(bartenderFormSchema),
    });

    useEffect(() => {
        if (bartenderData && bartenderData.bartender != null) {
            // pedir para o backend enviar a solicitação
        }
    
        setLoading(false);
    }, [bartenderData]);

    // Ao clicar em entrar
    const validateBartenderCode = (data: BartenderFormData) => {
        const { securityCode } = data;
        try {
            getBartender({
                variables: { input: { securityCode: securityCode } },
            });
        } catch (error) {
            console.error("Erro ao buscar o garçom:", error);
        }
    };

    return (
        <>
            { loading 
            ? ( <Loading title="Aguarde, carregando..." /> ) 
            : (
                <form className="bartender-container" onSubmit={handleSubmit(validateBartenderCode)}>
                    <label className='label-input'>Senha:</label>
                    <input
                        className='input'
                        type="text"
                        aria-label="securityCode input"
                        placeholder="Código de garçom"
                        {...register('securityCode')}
                    />
                    {errors.securityCode && <span className='error-input'>{errors.securityCode.message}</span>}
                    <button className='button' type="submit">Enviar</button>
                </form>
            )}
        </>
    )
}

export default BartenderAuth;
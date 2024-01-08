/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import '../Login/login.scss';
import './bartenderAuth.scss';

import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Loading from "../../components/Loading";
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { BARTENDER_AUTH_RESPONSE, GetBartender, UPDATE_BARTENDER } from "../../graphql/queries/bartenderQueries";

interface BartenderFormData {
    securityCode: string;
};

const bartenderFormSchema = z.object({
    securityCode: z.string().nonempty('O código é obrigatório'),
});

function BartenderAuth() {
    const [loading, setLoading] = useState(true);
    const [isInputBlocked, setIsInputBlocked] = useState(false);
    const [resMessage, setResMessage] = useState('');
    const [updateBartender] = useMutation(UPDATE_BARTENDER);
    const { data: authResponseData } = useSubscription(BARTENDER_AUTH_RESPONSE);
    const [bartenderDataIsWaiting, setBartenderDataIsWaiting] = useState(null);
    const [getBartender, { data: bartenderData }] = useLazyQuery(GetBartender);
    const { register, setValue: setSecurityCodeValue, handleSubmit, formState: { errors } } = useForm<BartenderFormData>({
        resolver: zodResolver(bartenderFormSchema),
    });

    const verifyRequstsInCookie = () => {
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
        const bartenderDataIsWaiting = Cookies.get(cookieName ? cookieName : '');   
        setBartenderDataIsWaiting(bartenderDataIsWaiting ? () => {
            const data = JSON.parse(bartenderDataIsWaiting);
            setSecurityCodeValue('securityCode', data.securityCode);
            setIsInputBlocked(true);
            return data
        } : null);
    }

    useEffect(() => {
        console.log("Entrou");
        
        if (bartenderData && bartenderData.bartender.data !== null) {
            const data = bartenderData.bartender.data;
            if (!data.isWaiting && !data.isApproved) {
                updateBartender({ variables: {
                    input: {
                        id: data.id, 
                        isWaiting: true,
                        isApproved: false,
                        token: data.token
                    },
                }, });

                const dateExpires = new Date(new Date().getTime() + (24 * 60 * 60) * 1000); // 1 dia a partir de agora
                const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
                if (cookieName) {
                    Cookies.set(cookieName, JSON.stringify(data), { secure: true, sameSite: 'strict', expires: dateExpires });
                }
            }
        }
        verifyRequstsInCookie();

        if (bartenderData && bartenderData.bartender.message !== null) {
            setResMessage(bartenderData.bartender.message);
        }

        setLoading(false);
    }, [bartenderData]);

    useEffect(() => {
        // console.log("Dados da resposta da solicitação: ");        
        // console.log(authResponseData);   
        setIsInputBlocked(false);     
    }, [authResponseData]);

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
                    <label className='label-input'>Seu código de segurança:</label>
                    <input
                        className='input'
                        type="text"
                        aria-label="securityCode input"
                        placeholder="Código de garçom"
                        {...register('securityCode')}
                        disabled={isInputBlocked}
                    />
                    {errors.securityCode && <span className='error-input'>{errors.securityCode.message}</span>}
                    {resMessage !== '' && <span className='error-input'>{resMessage}</span>}
                    { bartenderDataIsWaiting
                    ? (<label className='label-input'>Aguardando aprovação...</label>) 
                    : (<button className='button' type="submit">Enviar</button>)}
                </form>
            )}
        </>
    )
}

export default BartenderAuth;
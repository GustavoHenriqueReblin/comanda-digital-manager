/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import '../Login/login.scss';
import './bartenderAuth.scss';
import Loading from "../../components/Loading";

import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { BARTENDER_AUTH_RESPONSE, GetBartender, UPDATE_BARTENDER } from "../../graphql/queries/bartenderQueries";
import { useNavigate } from 'react-router-dom';

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
    const [getBartender, { data: bartenderData }] = useLazyQuery(GetBartender, {fetchPolicy: 'cache-and-network'});
    const { register, setValue: setSecurityCodeValue, handleSubmit, formState: { errors } } = useForm<BartenderFormData>({
        resolver: zodResolver(bartenderFormSchema),
    });
    const navigate = useNavigate();

    const verifyRequstsInCookie = () => {
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
        const bartenderDataIsWaiting = Cookies.get(cookieName ? cookieName : '');   
        setBartenderDataIsWaiting(bartenderDataIsWaiting ? () => {
            const data = JSON.parse(bartenderDataIsWaiting);
            setSecurityCodeValue('securityCode', data.securityCode);
            setIsInputBlocked(true);
            return data
        } : null);
    };

    const verifyBartenderToken = () => {
        const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
        const bartenderToken = Cookies.get(cookieName ? cookieName : '');   
        if (bartenderToken) {
            navigate('/queue');
        }
    };

    useEffect(() => {
        if (bartenderData && bartenderData.bartender.data !== null) {
            const data = bartenderData.bartender.data;
            const dateExpires = new Date(new Date().getTime() + (24 * 60 * 60) * 1000); // 1 dia a partir de agora

            if (!data.isWaiting && !data.token && !isInputBlocked) {
                updateBartender({ variables: {
                    input: {
                        id: data.id, 
                        isWaiting: true,
                        token: data.token
                    },
                }, });
            
                const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_REQUEST;
                if (cookieName) {
                    Cookies.set(cookieName, JSON.stringify(data), { secure: true, sameSite: 'strict', expires: dateExpires });
                }
            } else {
                if (data.token) {
                    const cookieName = process.env.REACT_APP_COOKIE_NAME_BARTENDER_TOKEN;
                    if (cookieName) {
                        Cookies.set(cookieName, JSON.stringify(data.token), { secure: true, sameSite: 'strict', expires: dateExpires });
                    }
                }
            }
        }
        verifyBartenderToken();
        verifyRequstsInCookie();

        if (bartenderData && bartenderData.bartender.message !== null) {
            setResMessage(bartenderData.bartender.message);
        }

        setLoading(false);
    }, [bartenderData]);

    useEffect(() => {     
        if (authResponseData) {
            setIsInputBlocked(false);
            if (authResponseData.authBartenderResponse.isApproved) {
                navigate('/queue');
            }else {
                window.location.reload();
                console.log("Recusou");
            }
        } 
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
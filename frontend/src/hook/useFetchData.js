import { useState, useEffect } from "react";

export default function useFetchData(handleFunction, isSaving) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const dataShow = async () => {
            try {
                setIsLoading(true);

                const response = await handleFunction();

                setData(response.data.data);
            } catch (error) {
                console.log("err", error);
            } finally {
                setIsLoading(false);
            }
        };

        dataShow();
    }, [isSaving]);

    return { data, isLoading };
}
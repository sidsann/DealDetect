import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Modal from '@mui/joy/Modal';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import { Table, TableBody, TableRow, TableCell } from '@mui/material';

interface MoreInformationProps {
    open: boolean;
    onClose: () => void;
}

const MoreInformation: React.FC<MoreInformationProps> = ({ open, onClose }) => {
    const [averagePrice, setAveragePrice] = useState<number | null>(null);
    const [productAmount, setProductAmount] = useState<number | null>(null);
    const [topRatedProduct, setTopRatedProduct] = useState<string | null>(null);
    const [cheapestProduct, setCheapestProduct] = useState<string | null>(null);
    const [mostExpensiveProduct, setMostExpensiveProduct] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            // Fetch average price
            const averagePriceResponse = await fetch('http://localhost:8080/average_price');
            const averagePriceData = await averagePriceResponse.json();
            console.log('Average Price Data:', averagePriceData); // Debugging line
            setAveragePrice(averagePriceData[0]?.Average || null);

            // Fetch product amount (assuming the endpoint returns a single value)
            const productAmountResponse = await fetch('http://localhost:8080/count_product');
            const productAmountData = await productAmountResponse.json();
            console.log(productAmountData);
            setProductAmount(productAmountData[0]?.ProductCount || null);

            // Fetch top-rated product
            const topRatedProductResponse = await fetch('http://localhost:8080/top_rated_products');
            const topRatedProductData = await topRatedProductResponse.json();
            setTopRatedProduct(topRatedProductData[0]?.Title || null);

            // Fetch cheapest product
            const cheapestProductResponse = await fetch('http://localhost:8080/top_cheapest_products');
            const cheapestProductData = await cheapestProductResponse.json();
            setCheapestProduct(cheapestProductData[0]?.Title || null);

            // Fetch most expensive product
            const mostExpensiveProductResponse = await fetch('http://localhost:8080/top_expensive_products');
            const mostExpensiveProductData = await mostExpensiveProductResponse.json();
            setMostExpensiveProduct(mostExpensiveProductData[0]?.Title || null);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);


    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: 400, padding: 2, textAlign: 'center', backgroundColor: 'white', borderRadius: 8, boxShadow: 3 }}>
                    <Typography sx={{ variant: 'h2', fontWeight: 'bold' }}>More Information</Typography>

                    <Box display="flex" justifyContent="center" alignItems="center" sx={{ borderBottom: '1px solid lightgrey' }}>
                        <Typography sx={{ variant: "h5", fontWeight: 'bold', display: 'inline' }}>
                            Average Price:&nbsp;
                        </Typography>
                        <Typography sx={{ variant: 'body1', display: 'inline' }}>
                            {averagePrice !== null ? `$${averagePrice.toFixed(2)}` : 'Loading...'}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center" alignItems="center" sx={{ borderBottom: '1px solid lightgrey' }}>
                        <Typography sx={{ variant: "h5", fontWeight: 'bold', display: 'inline' }}>
                            Product Amount:&nbsp;
                        </Typography>
                        <Typography sx={{ variant: 'body1', display: 'inline' }}>
                            {productAmount !== null ? `$${productAmount.toFixed(2)}` : 'Loading...'}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center" alignItems="center" sx={{ borderBottom: '1px solid lightgrey' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 'h5.fontSize', display: 'inline' }}>
                            Top Rated Product:&nbsp;
                        </Typography>
                        <Typography sx={{ variant: 'body1', display: 'inline' }}>
                            {topRatedProduct !== null ? `$${topRatedProduct}` : 'Loading...'}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center" alignItems="center" sx={{ borderBottom: '1px solid lightgrey' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 'h5.fontSize', display: 'inline' }}>
                            Cheapest Product:&nbsp;
                        </Typography>
                        <Typography sx={{ variant: 'body1', display: 'inline' }}>
                            {cheapestProduct !== null ? `$${cheapestProduct}` : 'Loading...'}
                        </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <Typography component="span" sx={{ fontWeight: 'bold', fontSize: 'h5.fontSize', display: 'inline' }}>
                            Most Expensive Product:&nbsp;
                        </Typography>
                        <Typography component="span" sx={{ display: 'inline' }}>
                            {mostExpensiveProduct !== null ? mostExpensiveProduct : 'Loading...'}
                        </Typography>
                    </Box>

                


                    <Button onClick={onClose} sx={{ marginTop: 2 }}>Close</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default MoreInformation;








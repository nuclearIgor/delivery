import {Box, Button, Grid, MenuItem, Select} from "@mui/material";
import {FormEvent, FunctionComponent, useCallback, useEffect, useRef, useState} from "react";
import {Route} from "../utils/models";
import {Loader} from "google-maps";
import {getCurrentPosition} from "../utils/geolocation";
import {GoogleMap, makeCarIcon, makeMarkerIcon} from "../utils/map";
import { sample, shuffle} from 'lodash'
import {RouteExistsError} from "../errors/route-exists.error";
import {useSnackbar} from "notistack";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {NavBar} from "./NavBar";

import {io} from 'socket.io-client'


const colors = [
    "#b71c1c",
    "#4a148c",
    "#2e7d32",
    "#e65100",
    "#2962ff",
    "#c2185b",
    "#FFCD00",
    "#3e2723",
    "#03a9f4",
    "#827717",
];

const API_URL = process.env.REACT_APP_API_URL

const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY)

export const Mapping: FunctionComponent = () => {
    const [routes, setRoutes] = useState<Route[]>([])
    const [selectedRouteId, setSelectedRouteId] = useState<string>('')

    const mapRef = useRef<GoogleMap>()

    const socketIoRef = useRef<any>()

    const finishRoute = useCallback((route: Route) => {
        enqueueSnackbar(`${route.title} finalizou`, {variant: "success"})
    }, [])

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log('nono')
        } else {
            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    // console.log(pos)
                })
        };

        if(!socketIoRef.current?.connected) {
            const socket = io(`${API_URL}`)
            socketIoRef.current = socket
            socketIoRef.current.on('connect', () => console.log('socketref conectado'))
        }

        const handler = (data: {
            routeId: string,
            position: [number, number],
            finished: boolean
        }) => {
            mapRef.current?.moveCurrentMarker(data.routeId, {
                lat: data.position[0],
                lng: data.position[1]
            })
            const route = routes.find(route => route._id === selectedRouteId) as Route

            if(data.finished) {
                finishRoute(route)
            }
        }

        socketIoRef.current.on('new-position', handler)

        return () => {
            socketIoRef.current.off('new-position', handler)
        }

    }, [finishRoute, selectedRouteId, routes])


    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {
        fetch(`${API_URL}/routes`)
            .then(data => data.json())
            .then(data => setRoutes(data))
    }, [])

    useEffect(() => {
        (async () => {
        const [_, position] = await Promise.all([
            googleMapsLoader.load(),
            getCurrentPosition({enableHighAccuracy: true})
        ])

        const divMap = document.getElementById("map") as HTMLElement
            mapRef.current = new GoogleMap(divMap, {
                zoom: 15,
                center: position
        })

            // mapRef.current = new google.maps.Map(divMap, {
            //     zoom: 15,
            //     center: position
            // })

        })()
    }, [])

    const startRoute = useCallback((event: FormEvent) => {
        event.preventDefault()

        const route = routes.find(route => route._id === selectedRouteId)
        const color = sample(shuffle(colors)) as string

        try {
            mapRef.current?.addRoute( selectedRouteId ,{
                currentMarkerOptions: {
                    position: route?.startPosition,
                    icon: makeCarIcon(color),
                },
                endMarkerOptions: {
                    position: route?.endPosition,
                    icon: makeMarkerIcon(color)
                }
            })

            socketIoRef.current.emit('new-direction', {
                routeId: selectedRouteId
            })
        } catch (e) {
            if (e instanceof RouteExistsError) {
                enqueueSnackbar(`${route?.title} ja adicionado. Espere finalizar`, {variant: "warning"})
                return
            }
            throw e
        }
    }, [selectedRouteId, routes])

    return (
        <Grid container sx={{
            width: '100%',
            height: '100%',
        }}>
            <Grid item xs={12} sm={3}>
                <NavBar/>
                <form onSubmit={startRoute} style={{
                    margin: '16px'
                }}>
                    <Select fullWidth displayEmpty
                            value={selectedRouteId}
                            onChange={e => setSelectedRouteId(e.target.value + "")}>
                        <MenuItem value={""}>
                            <em>Selecione uma corrida</em>
                        </MenuItem>

                        {routes.map((route, key) => (
                            <MenuItem value={route._id} key={key}>
                                {route.title}
                            </MenuItem>
                        ))}


                    </Select>

                    <Box sx={{
                        textAlign: 'center',
                        marginTop: '8px'
                    }}>
                        <Button type={"submit"} color={"primary"} variant={"contained"}>
                            Iniciar corrida</Button>
                    </Box>
                </form>
            </Grid>
            <Grid item xs={12} sm={9}>
                <Box id="map" sx={{
                    width: '100%',
                    height: '100%',
                }}>

                </Box>
            </Grid>
        </Grid>
    );
};
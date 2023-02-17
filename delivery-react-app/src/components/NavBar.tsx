import {FunctionComponent} from "react";
import {AppBar, IconButton, Toolbar, Typography} from "@mui/material";
import { DriveEta } from '@mui/icons-material'

export const NavBar: FunctionComponent = () => {
    return (
        <AppBar position={"static"}>
            <Toolbar>
                <IconButton edge={"start"} color={"inherit"} aria-label={"menu"}>
                    <DriveEta/>
                </IconButton>
                <Typography variant={"h6"}>Delivery</Typography>
            </Toolbar>
        </AppBar>
    );
};
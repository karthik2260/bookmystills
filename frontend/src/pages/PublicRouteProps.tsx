import React from "react";



type RouteTypes = 'user'

interface PublicRouteProps {
    routeType : RouteTypes
}

const PublicRoute: React.FC<PublicRouteProps> = ({routeType}) => {
    const userSignedIn = 
}
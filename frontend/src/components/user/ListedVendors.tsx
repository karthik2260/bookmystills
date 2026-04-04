import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faStar,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CardFooter, Input } from "@material-tailwind/react";
import {
  Box,
  Grid,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Container,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { USER } from "../../config/constants/constants";
import type { VendorData } from "../../types/vendorTypes";
import { AcceptanceStatus, VendorResponse } from "../../types/vendorTypes";
import Loader from "../common/Loader";

import { fetchVendors } from "@/services/serviceapi";

const ListedVendors = () => {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);

  const navigate = useNavigate();

  const fetchVendorsData = useCallback(async (page: number, search: string) => {
    setIsLoading(true);

    try {
      const data = await fetchVendors(page, search);

      const transformedVendors: VendorData[] = data.vendors.map((vendor) => {
        const { imageUrl, ...vendorData } = vendor;
        return {
          ...vendorData,
          imageUrl,
        };
      });

      setVendors(transformedVendors);
      setTotalPages(data.totalPages);

      console.log("Vendors from API:", transformedVendors);
      console.log(
        "Filtered count:",
        transformedVendors.filter(
          (v) =>
            v.isActive &&
            v.isVerified &&
            v.isAccepted === AcceptanceStatus.Accepted,
        ).length,
      );
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const debouncedFetchData = useMemo(
    () => debounce(fetchVendorsData, 500),
    [fetchVendorsData],
  );

  useEffect(() => {
    if (searchTerm.trim().length >= 3) {
      debouncedFetchData(currentPage, searchTerm);
    } else if (searchTerm.trim() === "") {
      debouncedFetchData(currentPage, "");
    }
    return () => {
      debouncedFetchData.cancel();
    };
  }, [currentPage, searchTerm, debouncedFetchData]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleShowDetails = (vendor: VendorData) => {
    setSelectedVendor(vendor);
    setModalOpen(true);
  };

  const viewPorfolio = (vendorId: string) => {
    navigate(`${USER.PORTFOLIO}/${vendorId}`);
  };

  const PostModal = () => {
    if (!selectedVendor || !modalOpen) return null;

    return (
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="flex items-center justify-center overflow-y-auto overflow-x-hidden"
      >
        <Box className="relative bg-white dark:bg-gray-900 w-full max-w-6xl mx-4 rounded-lg overflow-hidden flex flex-col md:flex-row md:h-[80vh]">
          <div className="relative w-full md:w-[60%] h -full bg-black flex items-center justify-center">
            <IconButton
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 md:hidden"
            >
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>

            <div className="relative w-full h-full">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                wheel={{ step: 0.1 }}
              >
                <TransformComponent
                  wrapperClass="w-full h-full"
                  contentClass="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={selectedVendor.imageUrl || "/images/p5.jpg"}
                    alt={selectedVendor.name}
                    className="max-w-full max-h-full object-fill"
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>

          <div className="w-full md:w-[40%] flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedVendor.name}</h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedVendor.companyName}
                </p>
              </div>
              <IconButton
                onClick={() => setModalOpen(false)}
                className="hidden md:flex"
              >
                <FontAwesomeIcon icon={faTimes} />
              </IconButton>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-600">{selectedVendor.about}</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Contact Information
                  </h3>
                  {selectedVendor.email && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      <span>{selectedVendor.email}</span>
                    </div>
                  )}
                  {selectedVendor.contactinfo && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faPhone} className="mr-2" />
                      <span>{selectedVendor.contactinfo}</span>
                    </div>
                  )}
                  {selectedVendor.city && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                      <span>{selectedVendor.city}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-yellow-400 mr-2"
                    />
                    <span className="font-semibold">
                      Rating: {selectedVendor.totalRating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    );
  };

  return (
    <Container sx={{ py: 2 }}>
      <div className="flex flex-col items-center py-5 md:py-20">
        <h2 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] uppercase text-center mb-5">
          Vendors LIST
        </h2>
        <div className="w-full lg:w-1/3 md:w-1/2 sm:w-full">
          <Input
            label="Search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search vendors..."
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 rounded-xl"
            labelProps={{
              className: "hidden",
            }}
            containerProps={{
              className: "min-w-[100px] relative",
            }}
          />
        </div>
      </div>

      <Box sx={{ flexGrow: 1 }}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{ padding: { xs: 2, sm: 3, md: 4 } }}
        >
          {isLoading ? (
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <Loader />
            </Grid>
          ) : vendors.length === 0 ? (
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <Typography variant="body1">No vendors found</Typography>
            </Grid>
          ) : (
            vendors.map((vendor) => (
              <>
                {vendor.isActive &&
                  vendor.isVerified &&
                  vendor.isAccepted === AcceptanceStatus.Accepted && (
                    <Grid item xs={4} sm={4} md={4} key={vendor._id}>
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          "&:hover": {
                            boxShadow: 6,
                            transform: "translateY(-4px)",
                            transition: "all 0.3s ease-in-out",
                          },
                        }}
                      >
                        <CardMedia
                          sx={{ height: 300 }}
                          image={vendor.imageUrl || "/images/p5.jpg"}
                          title={vendor.name}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            {vendor?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {vendor?.about}
                          </Typography>
                        </CardContent>
                        <CardActions
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "8px 16px 16px",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                              marginBottom: "12px",
                            }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleShowDetails(vendor)}
                              sx={{
                                borderColor: "#000000",
                                color: "#000000",
                                width: "48%",
                                "&:hover": {
                                  borderColor: "#333333",
                                  color: "#333333",
                                },
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: "#000000",
                                color: "#000000",
                                width: "48%",
                                "&:hover": {
                                  borderColor: "#333333",
                                  color: "#333333",
                                },
                              }}
                            >
                              Report Vendor
                            </Button>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => viewPorfolio(vendor._id)}
                            sx={{
                              backgroundColor: "#000000",
                              color: "#FFFFFF",
                              width: "100%",
                              "&:hover": {
                                backgroundColor: "#333333",
                              },
                            }}
                          >
                            View Portfolio
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  )}
              </>
            ))
          )}
        </Grid>
        <CardFooter
          className="flex items-center justify-between border-t border-blue-gray-50 p-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <Typography
            color="blue-gray"
            className="font-normal"
            component="span"
          >
            Page {currentPage} of {totalPages}
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              sx={{
                borderColor: "#000000",
                color: "#000000",
              }}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              sx={{
                borderColor: "#000000",
                color: "#000000",
              }}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Box>

      <PostModal />
    </Container>
  );
};

export default ListedVendors;

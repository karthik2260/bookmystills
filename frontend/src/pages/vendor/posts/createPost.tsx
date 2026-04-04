import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Button,
  Image,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import type { ReactCropperElement } from "react-cropper";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Plus, X, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import { VENDOR } from "../../../config/constants/constants";
import SidebarVendor from "../../../layout/vendor/SidebarProfileVendor";
import { showToastMessage } from "../../../validations/common/toast";

import { axiosInstanceVendor } from "@/config/api/axiosinstance";
import { submitPostApi } from "@/services/vendorserviceapi";
import type { PostFormData, PostData } from "@/types/postTypes";
import { ServiceProvided, PostStatus } from "@/types/postTypes";
import { postValidationSchema } from "@/validations/vendor/postValidationSchema";

interface CreatePostProps {
  isEditMode?: boolean;
  existingPost?: PostData | null;
  onClose?: () => void;
}

export default function CreatePost({
  isEditMode = false,
  existingPost,
  onClose,
}: CreatePostProps) {
  const navigate = useNavigate();
  const MAX_IMAGES = 6;

  const [formData, setFormData] = useState<PostFormData>({
    caption: existingPost?.caption || "",
    location: existingPost?.location || "",
    serviceType: existingPost?.serviceType || "",
    status: existingPost?.status || "",
    images: Array(MAX_IMAGES).fill(null),
  });

  const [existingImages, setExistingImages] = useState<string[]>(() => {
    if (!existingPost?.imageUrl) return Array(MAX_IMAGES).fill("");

    const urls = Array.isArray(existingPost.imageUrl)
      ? existingPost.imageUrl
      : [existingPost.imageUrl];

    const validUrls = urls.slice(0, MAX_IMAGES);

    return [...validUrls, ...Array(MAX_IMAGES - validUrls.length).fill("")];
  });

  const [imageFiles, setImageFiles] = useState<(File | null)[]>(
    Array(MAX_IMAGES).fill(null),
  );
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const handleInputChange = (field: keyof PostFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToastMessage("Invalid image type", "error");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToastMessage("Image must be less than 8MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result as string);
      setCurrentImageIndex(index);
    };
    reader.readAsDataURL(file);
  };

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || currentImageIndex === null) return;

    const canvas = cropper.getCroppedCanvas();
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/jpeg");
    });

    const file = new File([blob], `image-${currentImageIndex}.jpg`, {
      type: "image/jpeg",
    });

    setImageFiles((prev) => {
      const updated = [...prev];
      updated[currentImageIndex] = file;
      return updated;
    });

    const previewUrl = URL.createObjectURL(file);

    setExistingImages((prev) => {
      const updated = [...prev];
      updated[currentImageIndex] = previewUrl;
      return updated;
    });

    setCropperSrc(null);
    setCurrentImageIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    setExistingImages((prev) => {
      const updated = [...prev];
      if (updated[index] && !updated[index].startsWith("blob:")) {
        setDeletedImages((d) => [...d, updated[index]]);
      }
      updated[index] = "";
      return updated;
    });

    setImageFiles((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const schema = postValidationSchema(isEditMode, existingPost);

      await schema.validate(
        {
          ...formData,
          images: imageFiles,
        },
        { abortEarly: false },
      );

      setIsSubmitting(true);

      const form = new FormData();

      form.append("caption", formData.caption);
      form.append("location", formData.location);
      form.append("serviceType", formData.serviceType);
      form.append("status", formData.status);

      if (isEditMode) {
        const remainingImages = existingImages.filter(
          (url, i) =>
            url &&
            !url.startsWith("blob:") &&
            !deletedImages.includes(url) &&
            !imageFiles[i],
        );

        if (remainingImages.length > 0) {
          form.append("existingImages", remainingImages.join(","));
        }

        if (deletedImages.length > 0) {
          form.append("deletedImages", deletedImages.join(","));
        }
      }

      imageFiles.forEach((file) => {
        if (file) form.append("images", file);
      });

      // ✅ SERVICE CALL
      await submitPostApi(isEditMode, existingPost?._id, form);

      showToastMessage("Success!", "success");

      if (isEditMode && onClose) {
        onClose();
      } else {
        navigate(VENDOR.VIEW_POSTS);
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const err: Record<string, string> = {};
        error.inner.forEach((e) => {
          if (e.path) err[e.path] = e.message;
        });
        setErrors(err);
      }

      showToastMessage("Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      existingImages.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [existingImages]);

  return (
    <div className="flex">
      {!isEditMode && (
        <div>
          <SidebarVendor />
        </div>
      )}
      <div className="container mx-auto ">
        <form onSubmit={handleSubmit}>
          <Card className="w-full max-w-3xl mx-auto my-8">
            <CardHeader className="flex justify-center bg-black">
              <h1 className="text-2xl font-bold text-white">
                {isEditMode ? "Edit Post" : "Upload Contents"}
              </h1>
            </CardHeader>
            <CardBody className="gap-4">
              {/* Form fields remain the same */}
              <Select
                key={`serviceType-${formData.serviceType}`}
                label="Service Type"
                placeholder="Select service type"
                // value={formData.serviceType}
                selectedKeys={
                  formData.serviceType ? [formData.serviceType] : []
                }
                onChange={(e) =>
                  handleInputChange("serviceType", e.target.value)
                }
                errorMessage={errors.serviceType}
                isInvalid={!!errors.serviceType}
                isRequired
              >
                {Object.values(ServiceProvided).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </Select>

              <Select
                key={`status-${formData.status}`}
                label="Status"
                placeholder="Select status"
                // value={formData.status}
                selectedKeys={formData.status ? [formData.status] : []}
                onChange={(e) => handleInputChange("status", e.target.value)}
                errorMessage={errors.status}
                isInvalid={!!errors.status}
                isRequired
              >
                {Object.values(PostStatus)
                  .filter((status) => status !== PostStatus.Blocked)
                  .map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
              </Select>

              <Input
                label="Caption"
                placeholder="Enter caption"
                value={formData.caption}
                onChange={(e) => handleInputChange("caption", e.target.value)}
                errorMessage={errors.caption}
                isInvalid={!!errors.caption}
                isRequired
              />

              <Input
                label="Location"
                placeholder="Enter location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                errorMessage={errors.location}
                isInvalid={!!errors.location}
                isRequired
              />

              {errors.images && (
                <div className="text-red-500 text-sm mt-1">{errors.images}</div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array(6)
                  .fill(null)
                  .map((_, index) => (
                    <motion.div
                      key={index}
                      className="relative aspect-square cursor-pointer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {existingImages[index] || imageFiles[index] ? (
                        <>
                          <Image
                            src={existingImages[index]}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center z-30 justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, index)}
                          />
                          <Plus size={24} className="text-gray-400" />
                        </label>
                      )}
                    </motion.div>
                  ))}
              </div>

              {/* Cropper modal */}
              {cropperSrc && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                >
                  <Card className="w-full max-w-md">
                    <CardBody>
                      <Cropper
                        ref={cropperRef}
                        src={cropperSrc}
                        style={{ height: 500, width: "100%" }}
                        aspectRatio={1}
                        guides={true}
                        viewMode={1}
                        dragMode="move"
                        background={false}
                        minCropBoxWidth={70}
                        minCropBoxHeight={70}
                        responsive={true}
                        restore={true}
                        zoomable={false}
                        checkCrossOrigin={false}
                      />
                      <div className="flex justify-end mt-4 gap-2">
                        <Button
                          color="danger"
                          onClick={() => setCropperSrc(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-black text-white"
                          onClick={handleCrop}
                        >
                          Crop & Save
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              <Button
                type="submit"
                className="mt-4 bg-black text-white"
                endContent={<Upload size={16} />}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
              >
                {isEditMode
                  ? isSubmitting
                    ? "Updating Post..."
                    : "Update Post"
                  : isSubmitting
                    ? "Creating Post..."
                    : "Create Post"}
              </Button>
            </CardBody>
          </Card>
        </form>
      </div>
    </div>
  );
}

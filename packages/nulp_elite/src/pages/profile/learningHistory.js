import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Card from "@mui/material/Card";
import * as util from "../../services/utilService";
import Filter from "components/filter";
import NoResult from "pages/content/noResultFound";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import appConfig from "../../configs/appConfig.json";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import BoxCard from "components/Card";
import { useParams, useNavigate, useLocation } from "react-router-dom";
const routeConfig = require("../../configs/routeConfig.json");

const LearningHistory = () => {
  const { t } = useTranslation();
  const [courseData, setCourseData] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [error, setError] = useState(null);
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(16); // Number of items per page
  const navigate = useNavigate();

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
      setToasterOpen(false);
    }, 2000);
    setToasterOpen(true);
  };

  const _userId = util.userId();

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.GET_ENROLLED_COURSES}/${_userId}?orgdetails=${appConfig.Course.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.Course.contentApiQueryParams.licenseDetails}&fields=${urlConfig.params.enrolledCourses.fields}&batchDetails=${urlConfig.params.enrolledCourses.batchDetails}`;
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };
    fetchData();
  }, [_userId, t]);

  const handleFilterChange = (selectedOptions) => {
    console.log("Selected filter options:", selectedOptions); // Debug: Check selected filter options
    setSelectedStatus(selectedOptions);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Paginate the course data first
  const paginatedCourseData = courseData?.result?.courses?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Then apply filters on the paginated data
  const filteredCourses = paginatedCourseData?.filter((course) => {
    if (selectedStatus.length > 0) {
      const selectedValues = selectedStatus.map((option) => option.value);
      return selectedValues.includes(course.status);
    }
    return true; // Show all if no filter selected
  });

  return (
    <div>
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <Container
        role="main"
        maxWidth="xl"
        className="filter-profile profile allContentProfile cardheight  profile-card"
      >
        {error && (
          <Alert severity="error" className="my-10">
            {error}
          </Alert>
        )}
        <Box textAlign="center" padding="10">
          <Box style={{ margin: "20px 0" }}>
            <Filter
              options={[
                { label: "Ongoing", value: 1 },
                { label: "Completed", value: 2 },
                { label: "Expired", value: 0 },
              ]}
              label="Filter by Status"
              onChange={handleFilterChange}
            />
          </Box>
          <Box>
            <Box className="custom-card">
              {filteredCourses?.length === 0 ? (
                <NoResult className="center-box" />
              ) : (
                filteredCourses?.map((course) => (
                  <Box className="custom-card-box" key={course.courseName}>
                    <BoxCard
                      items={course}
                      index={courseData.result.courses.length}
                      onClick={() =>
                        navigate(
                          `${routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE}?${course.content.identifier}`
                        )
                      }
                    />
                  </Box>
                ))
              )}
              <div className="blankCard"></div>
            </Box>
          </Box>
          <Pagination
            count={Math.ceil(courseData?.result?.courses?.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      </Container>
      <FloatingChatIcon />
      {/* <Footer /> */}
    </div>
  );
};

export default LearningHistory;

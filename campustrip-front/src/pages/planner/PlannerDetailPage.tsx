import React, { useState, useEffect, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import type { PlannerDetail } from "../../types/planner";
import { getPlannerDetail, deletePlanner } from "../../api/planners"; 

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MapSection = styled.div`
  width: 100%;
  height: 45%;
  flex-shrink: 0;
  position: relative;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  margin-top: -24px;
  padding: 24px 20px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  margin-bottom: 20px;
  text-align: center;
  position: relative;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.borderColor};
  margin: 0 auto 16px;
  border-radius: 2px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const Period = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const DaySection = styled.div`
  margin-bottom: 24px;
`;

const DayTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const PlaceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  margin-bottom: 8px;
`;

const NumberBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
`;

const PlaceContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlaceName = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const PlaceMemo = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-top: 4px;
`;

function PlannerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [planner, setPlanner] = useState<PlannerDetail | null>(null);

  useEffect(() => {
    if (id) {
      getPlannerDetail(Number(id)).then(setPlanner);
    }
  }, [id]);

  const pathCoordinates = useMemo(() => {
    if (!planner) return [];
    return planner.schedules.flatMap((schedule) =>
      schedule.places.map((p) => ({ lat: p.latitude, lng: p.longitude }))
    );
  }, [planner]);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deletePlanner(Number(id));
      navigate("/planner");
    }
  };

  const handleEdit = () => {
    navigate(`/posts/edit/${id}`); // 수정 페이지로 이동 
  };

  if (!isLoaded || !planner) return <div>Loading...</div>;

  return (
    <PageContainer>
      <MapSection>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={pathCoordinates[0] || { lat: 35.1149, lng: 129.0414 }}
          zoom={12}
          options={{ disableDefaultUI: true }}
        >
          <Polyline
            path={pathCoordinates}
            options={{ strokeColor: theme.colors.primary, strokeWeight: 5 }}
          />
          {planner.schedules.flatMap(s => s.places).map((place, idx) => (
             <Marker
                key={idx}
                position={{ lat: place.latitude, lng: place.longitude }}
                label={{ text: String(place.order), color: "white", fontWeight: "bold" }}
             />
          ))}
        </GoogleMap>
      </MapSection>

      <ContentContainer>
        <Header>
          <HandleBar />
          <Title>{planner.title}</Title>
          <Period>{planner.startDate} ~ {planner.endDate}</Period>
        </Header>

        <ButtonGroup>
           <ActionButton onClick={handleEdit}>수정</ActionButton>
           <ActionButton onClick={handleDelete}>삭제</ActionButton>
        </ButtonGroup>

        {planner.schedules.map((schedule) => (
          <DaySection key={schedule.day}>
            <DayTitle>{schedule.day}일차</DayTitle>
            {schedule.places.map((place) => (
              <PlaceItem key={place.order}>
                <NumberBadge>{place.order}</NumberBadge>
                <PlaceContent>
                  <PlaceName>{place.placeName}</PlaceName>
                  {place.memo && <PlaceMemo>{place.memo}</PlaceMemo>}
                </PlaceContent>
              </PlaceItem>
            ))}
          </DaySection>
        ))}
      </ContentContainer>
    </PageContainer>
  );
}

export default PlannerDetailPage;
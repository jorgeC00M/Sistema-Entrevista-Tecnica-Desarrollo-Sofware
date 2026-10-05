from django.urls import path

from .views import CurriculumDetailView, CurriculumListCreateView

urlpatterns = [
    path("", CurriculumListCreateView.as_view(), name="curriculums-list-create"),
    path("<int:pk>/", CurriculumDetailView.as_view(), name="curriculums-detail"),
]

from django.urls import path

from .views import CurriculumDetailView, CurriculumListCreateView, CurriculumRevisionView

urlpatterns = [
    path("", CurriculumListCreateView.as_view(), name="curriculums-list-create"),
    path("<int:pk>/", CurriculumDetailView.as_view(), name="curriculums-detail"),
    path("<int:pk>/revision/", CurriculumRevisionView.as_view(), name="curriculums-revision"),
]

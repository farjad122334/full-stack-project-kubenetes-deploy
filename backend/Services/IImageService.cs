using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services;

public interface IImageService
{
    Task<string?> SaveImageAsync(IFormFile? file, string folderName);
    Task<List<string>> SaveImagesAsync(List<IFormFile> files, string folderName);
    void DeleteImage(string imageUrl);
}
